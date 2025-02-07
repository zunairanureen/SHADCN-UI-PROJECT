import os
#from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.messages import HumanMessage, AIMessage

from chroma import vectorstore  # Ensure correct import

from langchain_groq import ChatGroq
# Now you can access the API key like this
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Get the API key


retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})


# System Prompt for Contextualizing Questions
system_prompt = """You are a question reformulation assistant. Your task is to:
1. Analyze the chat history and the latest user question.
2. If the question refers to previous context (e.g., 'it', 'this', 'that'):
    - Reformulate it into a self-contained question, including relevant context.
    - Keep the question short, clear, and to the point—avoid unnecessary length.
3. If the question is already self-contained, return it unchanged.
4. DO NOT answer or add explanations.
5. Provide concise, relevant, and well-structured answers in bullet points wherever necessary, focusing on clarity and brevity.

Example:
Chat History:
User: "What are the symptoms of diabetes?"
Assistant: "The main symptoms include increased thirst, frequent urination..."
User: "How is it diagnosed?"

Output: "How is diabetes diagnosed?"
Context: {context}
Question: {question}
"""

print("System prompt loaded successfully.")

# Now use the system prompt within the correct format for ChatPromptTemplate
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),  # Ensure the system message is in the correct form
        ("human", "{input}"),
        MessagesPlaceholder("chat_history"),
    ]
)


qa_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful Healthcare AI assistant. Use the following context to answer the user's question."),
    ("system", "Context: {context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])


def get_rag_chain(model="gpt-4o-mini"):
    llm = ChatGroq(model_name="mixtral-8x7b-32768", api_key=GROQ_API_KEY)
    #llm = ChatOpenAI(model=model, openai_api_key=os.getenv("OPENAI_API_KEY"))  # Ensure API key is passed
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)    
    return rag_chain

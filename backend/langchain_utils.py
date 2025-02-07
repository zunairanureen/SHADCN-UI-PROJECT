import os
#from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq

from chroma import vectorstore  
from dotenv import load_dotenv
load_dotenv() 

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})


system_prompt = """ You are a question reformulation assistant. Your task is to:
    1. Analyze the chat history and the latest user question
    2. If the question contains references (like 'it', 'this', 'that', 'they') to previous context:
    - Reformulate it into a self-contained question
    - Include relevant context from the chat history
    3. If the question is already self-contained:
    - Return it unchanged
    4. DO NOT answer the question
    5. DO NOT add any explanations

    Example:
    Chat History: 
    User: "What are the symptoms of diabetes?"
    Assistant: "The main symptoms include increased thirst, frequent urination..."
    User: "How is it diagnosed?"

    Your output should be: "How is diabetes diagnosed?" 
    Context: {context} 
    Question: {question}
"""

print("System prompt loaded successfully.")

contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt), 
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


def get_rag_chain(model="gpt-4o"):
    #llm = ChatOpenAI(model=model, openai_api_key="")  # Ensure API key is passed
    llm = ChatGroq(model_name="mixtral-8x7b-32768", api_key=GROQ_API_KEY)
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)    
    return rag_chain

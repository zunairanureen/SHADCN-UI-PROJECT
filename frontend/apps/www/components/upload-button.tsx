"use client";
import { useState } from 'react'

interface UploadButtonProps {
  onFileUpload: (fileName: string) => void;
}

export function UploadButton({ onFileUpload }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      onFileUpload(file.name)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <label className="relative cursor-pointer">
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.docx,.html"
          disabled={isUploading}
        />
        <div className="px-4 py-2 bg-[#a8e6cf] text-white rounded hover:bg-[#98d6bf] disabled:bg-gray-400">
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </div>
      </label>
    </div>
  )
}

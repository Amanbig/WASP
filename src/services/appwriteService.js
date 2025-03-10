// appwriteService.js
import { Client, Account, Databases, Storage, ID } from 'appwrite'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('6763024d0038091d468c') // Your project ID

const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

// Configuration
const DATABASE_ID = '6763029b0019f0ad0479'
const COLLECTION_ID = '676302b3000ed04f0489' // For storing file metadata
const BUCKET_ID = '676302de003e07ed0bbf'

class AppwriteService {
  // Authentication
  async login(email, password) {
    try {
      const session = await account.createEmailSession(email, password)
      return {
        userId: session.userId,
        email: session.email,
        sessionId: session.$id
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  }

  async signup(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name)
      await this.login(email, password) // Auto-login after signup
      await this.createUserDocument(user.$id, email, name)
      return user
    } catch (error) {
      throw new Error(error.message || 'Signup failed')
    }
  }

  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        'google',
        'http://localhost:3000/dashboard', // Success redirect URL
        'http://localhost:3000/login' // Failure redirect URL
      )
      const user = await account.get()
      await this.createUserDocument(user.$id, user.email, user.name)
      return user
    } catch (error) {
      throw new Error(error.message || 'Google login failed')
    }
  }

  async logout() {
    try {
      await account.deleteSession('current')
    } catch (error) {
      throw new Error(error.message || 'Logout failed')
    }
  }

  async getCurrentUser() {
    try {
      return await account.get()
    } catch (error) {
      return null
    }
  }

  // User Document Management
  async createUserDocument(userId, email, name) {
    try {
      const existingDoc = await this.getUserDocument(userId)
      if (!existingDoc) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          userId,
          {
            userId,
            email,
            name,
            createdAt: new Date().toISOString(),
            files: [] // Array to store file references
          }
        )
      }
    } catch (error) {
      console.error('Failed to create user document:', error)
    }
  }

  async getUserDocument(userId) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId)
    } catch (error) {
      return null
    }
  }

  // File Operations
  async uploadFile(file, userId) {
    try {
      // Upload file to storage
      const fileResponse = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      )

      // Update user document with file metadata
      const userDoc = await this.getUserDocument(userId)
      const fileMetadata = {
        fileId: fileResponse.$id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }

      const updatedFiles = [...(userDoc.files || []), fileMetadata]
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        { files: updatedFiles }
      )

      return fileResponse
    } catch (error) {
      throw new Error(error.message || 'File upload failed')
    }
  }

  async downloadFile(fileId) {
    try {
      const fileUrl = storage.getFileDownload(BUCKET_ID, fileId)
      return fileUrl // Returns a URL that can be used to download the file
    } catch (error) {
      throw new Error(error.message || 'File download failed')
    }
  }

  async deleteFile(fileId, userId) {
    try {
      // Delete file from storage
      await storage.deleteFile(BUCKET_ID, fileId)

      // Update user document by removing file metadata
      const userDoc = await this.getUserDocument(userId)
      const updatedFiles = userDoc.files.filter(file => file.fileId !== fileId)

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        { files: updatedFiles }
      )

      return true
    } catch (error) {
      throw new Error(error.message || 'File deletion failed')
    }
  }

  async getAllFiles(userId) {
    try {
      const userDoc = await this.getUserDocument(userId)
      return userDoc.files || []
    } catch (error) {
      throw new Error(error.message || 'Failed to get files')
    }
  }

  async getFileById(fileId, userId) {
    try {
      const userDoc = await this.getUserDocument(userId)
      const file = userDoc.files.find(f => f.fileId === fileId)
      if (!file) throw new Error('File not found')
      return file
    } catch (error) {
      throw new Error(error.message || 'Failed to get file')
    }
  }

  async getFileByName(fileName, userId) {
    try {
      const userDoc = await this.getUserDocument(userId)
      const file = userDoc.files.find(f => f.name === fileName)
      if (!file) throw new Error('File not found')
      return file
    } catch (error) {
      throw new Error(error.message || 'Failed to get file')
    }
  }
}

export default new AppwriteService()
import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

export interface PhotoFile {
  id: string
  name: string
  path: string
  handle: FileSystemFileHandle
  type: 'jpeg' | 'dng'
  size: number
  lastModified: number
  thumbnail?: string
  metadata?: Record<string, any>
}

export interface PhotoPair {
  id: string
  basename: string
  jpeg?: PhotoFile
  dng?: PhotoFile
}

export function useFileSystemAccess() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [photoPairs, setPhotoPairs] = useState<PhotoPair[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const requestDirectoryAccess = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      })
      
      const permission = await handle.requestPermission({ mode: 'readwrite' })
      if (permission === 'granted') {
        setDirectoryHandle(handle)
        setPermissionGranted(true)
        return handle
      } else {
        toast({
          title: 'アクセス拒否',
          description: 'フォルダーへのアクセスが拒否されました',
          variant: 'destructive'
        })
        return null
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // ユーザーがキャンセル
        return null
      }
      console.error('Failed to access directory:', error)
      toast({
        title: 'エラー',
        description: 'フォルダーの選択に失敗しました',
        variant: 'destructive'
      })
      return null
    }
  }, [])

  const scanDirectory = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true)
    const files: PhotoFile[] = []
    
    try {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile()
          const extension = file.name.toLowerCase().split('.').pop()
          
          if (extension === 'jpg' || extension === 'jpeg' || extension === 'dng') {
            files.push({
              id: crypto.randomUUID(),
              name: file.name,
              path: file.name,
              handle: entry,
              type: extension === 'dng' ? 'dng' : 'jpeg',
              size: file.size,
              lastModified: file.lastModified
            })
          }
        }
      }

      setPhotos(files)
      
      // ペアリング処理
      const pairs = new Map<string, PhotoPair>()
      
      files.forEach(file => {
        const basename = file.name.substring(0, file.name.lastIndexOf('.'))
        
        if (!pairs.has(basename)) {
          pairs.set(basename, {
            id: crypto.randomUUID(),
            basename
          })
        }
        
        const pair = pairs.get(basename)!
        if (file.type === 'jpeg') {
          pair.jpeg = file
        } else {
          pair.dng = file
        }
      })
      
      setPhotoPairs(Array.from(pairs.values()))
    } catch (error) {
      console.error('Failed to scan directory:', error)
      toast({
        title: 'スキャンエラー',
        description: 'フォルダーのスキャンに失敗しました',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const moveFile = useCallback(async (file: PhotoFile, targetDirectory: FileSystemDirectoryHandle) => {
    try {
      const sourceFile = await file.handle.getFile()
      const targetHandle = await targetDirectory.getFileHandle(file.name, { create: true })
      const writable = await targetHandle.createWritable()
      await writable.write(sourceFile)
      await writable.close()
      
      // 元ファイルを削除
      await file.handle.remove()
      
      return true
    } catch (error) {
      console.error('Failed to move file:', error)
      toast({
        title: 'エラー',
        description: `${file.name}の移動に失敗しました`,
        variant: 'destructive'
      })
      return false
    }
  }, [])

  const deleteFile = useCallback(async (file: PhotoFile) => {
    try {
      await file.handle.remove()
      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      toast({
        title: 'エラー',
        description: `${file.name}の削除に失敗しました`,
        variant: 'destructive'
      })
      return false
    }
  }, [])

  const movePair = useCallback(async (pair: PhotoPair, targetDirectory: FileSystemDirectoryHandle) => {
    const results = []
    
    if (pair.jpeg) {
      results.push(await moveFile(pair.jpeg, targetDirectory))
    }
    if (pair.dng) {
      results.push(await moveFile(pair.dng, targetDirectory))
    }
    
    return results.every(r => r)
  }, [moveFile])

  const deletePair = useCallback(async (pair: PhotoPair) => {
    const results = []
    
    if (pair.jpeg) {
      results.push(await deleteFile(pair.jpeg))
    }
    if (pair.dng) {
      results.push(await deleteFile(pair.dng))
    }
    
    return results.every(r => r)
  }, [deleteFile])

  return {
    directoryHandle,
    photos,
    photoPairs,
    isLoading,
    permissionGranted,
    requestDirectoryAccess,
    scanDirectory,
    moveFile,
    deleteFile,
    movePair,
    deletePair
  }
}
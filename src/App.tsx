import { useState, useEffect } from 'react'
import { useFileSystemAccess } from '@/hooks/useFileSystemAccess'
import { PhotoGallery } from '@/components/PhotoGallery'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { FolderOpen, Settings, Filter } from 'lucide-react'

function App() {
  const {
    directoryHandle,
    photoPairs,
    isLoading,
    requestDirectoryAccess,
    scanDirectory,
    movePair,
    deletePair
  } = useFileSystemAccess()

  const [loadingProgress, setLoadingProgress] = useState(0)

  const handleSelectFolder = async () => {
    const handle = await requestDirectoryAccess()
    if (handle) {
      await scanDirectory(handle)
    }
  }

  const handleMovePair = async (pair: any) => {
    try {
      const targetHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      })
      
      const success = await movePair(pair, targetHandle)
      if (success) {
        toast({
          title: '移動完了',
          description: `${pair.basename}を移動しました`
        })
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Failed to move pair:', error)
      }
    }
  }

  const handleDeletePair = async (pair: any) => {
    const confirmed = confirm(`${pair.basename}を削除しますか？`)
    if (confirmed) {
      const success = await deletePair(pair)
      if (success) {
        toast({
          title: '削除完了',
          description: `${pair.basename}を削除しました`
        })
      }
    }
  }

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
    }
  }, [isLoading])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ヘッダー */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Photo Sorter</h1>
          {directoryHandle && (
            <span className="text-sm text-muted-foreground">
              {photoPairs.length} ペア
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectFolder}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            フォルダーを選択
          </Button>
          
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        <PhotoGallery
          photoPairs={photoPairs}
          onMovePair={handleMovePair}
          onDeletePair={handleDeletePair}
          loadingProgress={isLoading ? loadingProgress : undefined}
        />
      </main>

      <Toaster />
    </div>
  )
}

export default App
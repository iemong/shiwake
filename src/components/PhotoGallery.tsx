import { useState, useEffect, useRef } from 'react'
import { PhotoPair } from '@/hooks/useFileSystemAccess'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, FolderOpen, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photoPairs: PhotoPair[]
  onMovePair?: (pair: PhotoPair) => void
  onDeletePair?: (pair: PhotoPair) => void
  onSelectPair?: (pair: PhotoPair) => void
  loadingProgress?: number
}

interface PhotoThumbnailProps {
  pair: PhotoPair
  isSelected: boolean
  onSelect: () => void
  onAction: (action: 'move' | 'delete') => void
}

function PhotoThumbnail({ pair, isSelected, onSelect, onAction }: PhotoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let objectUrl: string | null = null

    const loadThumbnail = async () => {
      try {
        const file = pair.jpeg || pair.dng
        if (!file) return

        const fileData = await file.handle.getFile()
        objectUrl = URL.createObjectURL(fileData)
        setThumbnailUrl(objectUrl)
      } catch (error) {
        console.error('Failed to load thumbnail:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadThumbnail()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [pair])

  return (
    <div 
      className={cn(
        "relative group rounded-lg overflow-hidden bg-secondary cursor-pointer transition-all",
        "hover:ring-2 hover:ring-primary",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <div className="aspect-square relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <img
            src={thumbnailUrl || ''}
            alt={pair.basename}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* 選択チェックマーク */}
        {isSelected && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}

        {/* ファイルタイプバッジ */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {pair.jpeg && (
            <span className="text-xs bg-background/80 px-1.5 py-0.5 rounded">
              JPG
            </span>
          )}
          {pair.dng && (
            <span className="text-xs bg-background/80 px-1.5 py-0.5 rounded">
              DNG
            </span>
          )}
        </div>

        {/* アクションメニュー */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/80"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('move')}>
                <FolderOpen className="mr-2 h-4 w-4" />
                移動
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAction('delete')}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* ファイル名 */}
      <div className="p-2">
        <p className="text-sm truncate">{pair.basename}</p>
      </div>
    </div>
  )
}

export function PhotoGallery({ 
  photoPairs, 
  onMovePair, 
  onDeletePair,
  onSelectPair,
  loadingProgress 
}: PhotoGalleryProps) {
  const [selectedPairs, setSelectedPairs] = useState<Set<string>>(new Set())

  const handleSelectPair = (pairId: string) => {
    const newSelected = new Set(selectedPairs)
    if (newSelected.has(pairId)) {
      newSelected.delete(pairId)
    } else {
      newSelected.add(pairId)
    }
    setSelectedPairs(newSelected)
    
    const pair = photoPairs.find(p => p.id === pairId)
    if (pair && onSelectPair) {
      onSelectPair(pair)
    }
  }

  const handleAction = (pair: PhotoPair, action: 'move' | 'delete') => {
    if (action === 'move' && onMovePair) {
      onMovePair(pair)
    } else if (action === 'delete' && onDeletePair) {
      onDeletePair(pair)
    }
  }

  if (loadingProgress !== undefined && loadingProgress < 100) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-lg">スキャン中...</div>
        <Progress value={loadingProgress} className="w-64" />
        <div className="text-sm text-muted-foreground">
          {loadingProgress.toFixed(0)}%
        </div>
      </div>
    )
  }

  if (photoPairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>写真がありません</p>
        <p className="text-sm mt-2">フォルダーを選択してください</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {photoPairs.map(pair => (
          <PhotoThumbnail
            key={pair.id}
            pair={pair}
            isSelected={selectedPairs.has(pair.id)}
            onSelect={() => handleSelectPair(pair.id)}
            onAction={(action) => handleAction(pair, action)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
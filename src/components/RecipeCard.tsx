'use client'

import { useState } from 'react'
import { Trash2, ImageOff } from 'lucide-react'

function recipeImageUrl(name: string): string {
  // 国内外直连极速、百分之百返回中式家常菜的高清图源
  // return `https://dustella.com/api/unsplash?query=${encodeURIComponent(name)}&type=food`
  return  `https://foodish-api.com/images/burger/burger${Math.floor(Math.random() * 100) + 1}.jpg`
}

interface Props {
  name: string
  category?: string
  difficulty?: string
  ingredientCount?: number
  stepCount?: number
  onDelete?: () => void
}

export default function RecipeCard({ name, category, difficulty, ingredientCount, stepCount, onDelete }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition bg-gray-100">
      {imgError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <ImageOff size={32} className="text-gray-400" />
        </div>
      ) : (
        <img
          src={recipeImageUrl(name)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute top-3 right-3 flex gap-1.5">
        {difficulty && (
          <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white font-medium">
            {difficulty}
          </span>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 bg-black/30 backdrop-blur-md rounded-full active:scale-90 transition hover:bg-black/50"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-white">
        {category && (
          <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-medium inline-block mb-1">
            {category}
          </span>
        )}
        <h3 className="text-lg font-bold flex items-center gap-1">{name}</h3>
        {(ingredientCount !== undefined || stepCount !== undefined) && (
          <p className="text-[10px] text-white/70 mt-0.5">
            {ingredientCount !== undefined && `${ingredientCount}种食材`}
            {stepCount !== undefined && ` · ${stepCount}步`}
          </p>
        )}
      </div>
    </div>
  )
}

import React from 'react';

const EMOJI_TO_MATERIAL: Record<string, string> = {
  '📁': 'folder',
  '📚': 'menu_book',
  '💼': 'work',
  '👤': 'person',
  '🚀': 'rocket_launch',
  '🎓': 'school',
  '💰': 'payments',
  '❤️': 'favorite',
  '❤': 'favorite',
  '🎯': 'target',
  '📌': 'push_pin',
  '💡': 'lightbulb',
  '🛠️': 'build',
  '🛠': 'build',
  '💻': 'computer',
  '🎨': 'palette',
  '⚙️': 'settings',
  '⚙': 'settings',
  '📊': 'bar_chart',
  '🌐': 'language',
  '📱': 'smartphone',
  '🔥': 'local_fire_department',
  '🟢': 'circle',
  '🟡': 'circle',
  '🔵': 'circle',
  '🔴': 'error',
  '✅': 'check_circle',
  '❌': 'cancel',
  '⏳': 'hourglass_empty',
  '🔄': 'sync',
  '👀': 'visibility',
  '📝': 'edit_note',
  '📄': 'description',
  '🎤': 'mic',
  '📋': 'assignment',
  '🧪': 'science',
  '📖': 'menu_book',
  '📥': 'inbox',
  '🔑': 'key',
  '✨': 'auto_awesome',
  '🧹': 'cleaning_services',
  '🎉': 'celebration',
  '⚠️': 'warning',
  '⚠': 'warning',
  '➕': 'add',
  '★': 'star',
  '🍅': 'timer',
};

export interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  fill?: boolean;
  size?: number | string;
}

export function MaterialIcon({
  name,
  className = '',
  fill = false,
  size,
  style,
  children,
  ...props
}: MaterialIconProps) {
  const rawName = name || (typeof children === 'string' ? children : '') || 'folder';
  const iconName = EMOJI_TO_MATERIAL[rawName] || rawName;

  const fontStyle: React.CSSProperties = {
    ...style,
  };

  if (size !== undefined) {
    fontStyle.fontSize = typeof size === 'number' ? `${size}px` : size;
  }

  if (fill) {
    fontStyle.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
  }

  return (
    <span
      className={`material-symbols-outlined select-none inline-block align-middle leading-none ${className}`}
      style={fontStyle}
      {...props}
    >
      {iconName}
    </span>
  );
}

export default MaterialIcon;

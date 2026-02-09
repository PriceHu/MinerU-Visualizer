import { BlockType } from '../types';

interface TypeStyle {
  border: string;
  bg: string;
  text: string;
  label: string;
}

export const BLOCK_STYLES: Record<string, TypeStyle> = {
  title: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-700',
    label: 'Title'
  },
  text: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    label: 'Text'
  },
  list: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-700',
    label: 'List'
  },
  table: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-700',
    label: 'Table'
  },
  image: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-700',
    label: 'Image'
  },
  header: {
    border: 'border-gray-400',
    bg: 'bg-gray-400/10',
    text: 'text-gray-600',
    label: 'Header'
  },
  footer: {
    border: 'border-gray-400',
    bg: 'bg-gray-400/10',
    text: 'text-gray-600',
    label: 'Footer'
  },
  page_number: {
    border: 'border-pink-500',
    bg: 'bg-pink-500/10',
    text: 'text-pink-700',
    label: 'Page Num'
  },
  equation: {
    border: 'border-teal-500',
    bg: 'bg-teal-500/10',
    text: 'text-teal-700',
    label: 'Equation'
  },
  caption: {
    border: 'border-indigo-500',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700',
    label: 'Caption'
  },
  unknown: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-700',
    label: 'Unknown'
  }
};

export const getBlockStyle = (type: string): TypeStyle => {
  const normalizedType = type.toLowerCase();

  // Handle Table sub-types
  if (normalizedType.startsWith('table')) {
    const base = BLOCK_STYLES.table;
    let label = 'Table';
    if (normalizedType.includes('caption')) label = 'Table Cap';
    else if (normalizedType.includes('body')) label = 'Table Body';
    else if (normalizedType.includes('footnote')) label = 'Table Note';
    
    return { ...base, label };
  }

  // Handle Image sub-types
  if (normalizedType.startsWith('image')) {
    const base = BLOCK_STYLES.image;
    let label = 'Image';
    if (normalizedType.includes('caption')) label = 'Img Cap';
    else if (normalizedType.includes('body')) label = 'Img Body';
    else if (normalizedType.includes('footnote')) label = 'Img Note';
    
    return { ...base, label };
  }

  // Map parsing types to our style keys if needed
  if (normalizedType.includes('header')) return BLOCK_STYLES.header;
  if (normalizedType.includes('footer')) return BLOCK_STYLES.footer;
  if (normalizedType.includes('caption')) return BLOCK_STYLES.caption;
  if (normalizedType.includes('page_number')) return BLOCK_STYLES.page_number;
  
  return BLOCK_STYLES[normalizedType] || BLOCK_STYLES.unknown;
};
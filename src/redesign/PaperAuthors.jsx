import React from 'react';

export default function PaperAuthors({ authors }) {
  if (!authors?.length) return null;
  return <span className="paper-authors">{authors.map((author,index) => <React.Fragment key={`${author}-${index}`}>
    {index > 0 ? ', ' : ''}{author === 'Rui Zhou' ? <strong>{author}</strong> : author}
  </React.Fragment>)}</span>;
}

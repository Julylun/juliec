import React from 'react';

interface TitleProps {
  title: string;
  description: string;
}

const Title: React.FC<TitleProps> = ({ title, description }) => (
  <>
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{title}</h1>
    <p className="text-lg text-[var(--text-secondary)] text-center max-w-xl mb-8">{description}</p>
  </>
);

export default Title; 
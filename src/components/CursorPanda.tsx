
import React, { useState, useEffect } from 'react';

const CursorPanda = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className={`fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
        visible ? 'opacity-70' : 'opacity-0'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <span className="text-2xl">🐼</span>
    </div>
  );
};

export default CursorPanda;

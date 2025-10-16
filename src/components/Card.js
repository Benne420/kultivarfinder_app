import React from 'react';

/**
 * Card component for wrapping content in a card layout
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @returns {JSX.Element} Card component
 */
const Card = ({ children }) => <div className="card">{children}</div>;

/**
 * CardContent component for the main content area of a card
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @returns {JSX.Element} CardContent component
 */
const CardContent = ({ children }) => <div>{children}</div>;

export { Card, CardContent };
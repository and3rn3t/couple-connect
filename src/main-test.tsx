import { createRoot } from 'react-dom/client';

// Simple test component
const TestApp = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ color: '#333' }}>🎉 App is Working!</h1>
      <p>If you can see this message, React is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

console.log('🚀 Starting app...');
const root = document.getElementById('root');
console.log('📍 Root element:', root);

if (root) {
  createRoot(root).render(<TestApp />);
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found');
}

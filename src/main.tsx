import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import GlobalStyle from './assets/styles/GlobalStyle.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GlobalStyle />
        <App />
    </StrictMode>,
)

import ReactDOM from 'react-dom/client'
import Home from './Home.jsx'
import VerifyOTP from './VerifyOTP.jsx'
import Chat from './Chat.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-right' } }}>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/verifyOTP' element={<VerifyOTP />} />
                <Route path='/chat' element={<Chat />} />
            </Routes>
        </BrowserRouter>
    </ChakraProvider>
)
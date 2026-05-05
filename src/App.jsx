import react from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './component/Navbar'
import Addcar from './component/Addcar'
import Managecar from './component/Managecar'
import EditCar from './component/Editcar'
import Booking from './component/Booking'

function App() {
  const location = useLocation(); 

  return (
    <div className='bg-gray-900 min-h-screen pt-4'>
      <Navbar/>

      <div className='bg-gray-900 '>
        <div className='p-2'>
          <Routes>
            <Route path='/' element={<Addcar />} />
            <Route path='/manage-car' element={<Managecar />} />
            <Route path="/edit-car/:id" element={<EditCar />} />
            <Route path='/booking' element={<Booking/>} />
            
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App

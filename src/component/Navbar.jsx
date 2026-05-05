import React, { useState , useEffect } from 'react';
import { Link } from 'react-router-dom';
import logocar from '../assets/logocar.png'
import { FaCar, FaPlus, FaBook } from "react-icons/fa";




const Navbar = () => {


  return (
    <div className='flex justify-between border-1 border-gray-300 shadow-lg rounded-4xl ml-50 mr-50 p-2 bg-gray-50'>
        <div>
      <img className='w-30 h-5' src={logocar} alt="" />
      <h1 className='font-bold pl-3 text-xl'>ADMIN</h1>
      </div>

      <div className='flex gap-3 pl-20 pr-10  mt-4 font-bold text-gray-600  '>
        <Link to={'/'}  className='hover:text-orange-700 flex gap-1 '><FaPlus /> <span className='-mt-1'>Add Car</span> </Link>
                <span className="h-5 w-px bg-gray-300 "></span>
        <Link to={'/manage-car'} className='hover:text-orange-700 flex gap-1 '><FaCar /> <span className='-mt-1'>Manage Car</span></Link>
                <span className="h-5 w-px bg-gray-300 "></span>
        <Link to={'/booking'}  className='hover:text-orange-700 flex gap-1'><FaBook /> <span className='-mt-1'>Booking</span></Link>
      </div>

      
    </div>
  );
}

export default Navbar;

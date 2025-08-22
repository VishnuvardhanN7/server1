import React from "react";
import './App.css'
import MainPage from './components/MainPage'
import Navbar from './components/Navbar'
import TabletReminder from './components/Medication'

function App() {
  return (
    <>
      <Navbar />
      <MainPage />
      <TabletReminder />
    </>
    
  )
}

export default App

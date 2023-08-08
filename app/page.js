'use client'
import Image from 'next/image'
import ThreeComponent from './components/ThreeComponent'

export default function Home() {

  const generateElement = () => {
    const newElement = new ThreeComponent();
    threeElements.push(newElement)
  }
  const threeElements = [];

  return (
   <ThreeComponent/>
  )
}

'use client'

import { useState } from 'react';
import { useEffect } from 'react'
import bcrypt from 'bcryptjs'
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if(!username || !password) {
        console.error('Username and password are required')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('username', username)
        .single()

      console.log(data)

      if (error || !data) {
        console.error('User not found or query error:', error)
        return
      }

      const isMatch = await bcrypt.compare(password, data.password)

      if (!isMatch) {
        console.error('Incorrect password')
        return
      }
      
      console.log('Login successful:', data.username)

      if (data.role == 'doctor') {
        router.push('/doctor');
      } else if (data.role == 'pharmacist') {
        router.push('/pharma')
      } else if (data.role == 'admin') {
        router.push('/admin')
      } else {
        console.error('Invalid role:', data.role);
        return
      }

    } catch (err) {
      console.error('Unexpected error during login:', err)
    }
  }

  const newAccount = () => {
    router.push('/newaccount');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
        className="bg-[#f9f9f9] p-8 rounded-sm shadow-xl w-88"
      >
        <h1 className="mt-5 text-2xl font-bold mb-7 text-center text-neutral-950">
          Login
        </h1>

        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">Username</label>
          <input
            type="text"
            placeholder="type your username here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-200 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium text-neutral-900">Password</label>
          <input
            type="password"
            placeholder="type your password here"
            className="mt-1 w-full p-2 border-2 rounded-sm outline-none placeholder-gray-200 focus:border-purple-700 focus:placeholder-transparent focus:text-neutral-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-12 mb-10 w-full p-2 text-white rounded-xl bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: "url('/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all duration-300" />
          <span className="relative z-10">LOGIN</span>
        </button>

        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={newAccount}
            className="mb-2 text-sm hover:underline transition font-semibold text-[#ee0035]"
          >
            Create New User
          </button>
        </div>
      </form>
    </div>
  )
}
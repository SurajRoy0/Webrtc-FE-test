
"use client"

import { useSocket } from '@/context/socketProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const Lobby = () => {
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');

  const router = useRouter()

  const socket = useSocket();
  console.log(socket, "socket @@@")
  const handleSubmit = useCallback( (e) => {
    e.preventDefault();
    console.log('submit process done!')
    socket.emit('room:join', {email, room});
  },[email, room, socket]);

  const handleJoinRoom = useCallback((data) => {
    const {email, room} = data;
    console.log(email, room,  "Room Join")
    router.push(`/room/${room}`)
  },[]) 

  useEffect(() => {
    socket.on('room:join', handleJoinRoom);

    return () => {
        socket.off('room:join', handleJoinRoom)
    }
  },[socket, handleJoinRoom])

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex h-[80vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-blue-500">
            Enter the lobby now
          </h2>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-blue-500">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='Enter Email'
                  autoComplete="email"
                  className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
            <label htmlFor="room" className="block text-sm font-medium leading-6 text-blue-500">
                  Lobby Number
                </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                  placeholder='Enter Lobby Number'
                  autoComplete="room"
                  className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:bg-red-900"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Lobby;

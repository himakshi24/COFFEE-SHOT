import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LaunchEvent from '../Components/LaunchEvent/LaunchEvent'

const API_URL = 'http://localhost:5000/api'

const LaunchPage = () => {
  const navigate = useNavigate()
  const [adminRequests, setAdminRequests] = useState([])

  const sendRequestToAdmin = async (request) => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`${API_URL}/event-launch-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hostName: request.eventGroupName,
          email: request.email,
          phone: request.contactNumber,
          title: request.eventGroupName,
          description: request.peopleNames,
          date: request.date,
          time: request.time,
          location: request.location,
          expectedGuests: Number(request.peopleCount || 0),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Event launch request failed.')
      }

      setAdminRequests((currentRequests) => [
        ...currentRequests,
        {
          ...request,
          id: Date.now(),
          status: 'pending',
          backendId: data.data?._id,
        },
      ])

      return data
    } catch (error) {
      alert(error.message)
      throw error
    }
  }

  return <LaunchEvent onRequestSubmit={sendRequestToAdmin} adminRequests={adminRequests} />
}

export default LaunchPage

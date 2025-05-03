"use client"

import { useEffect, useRef } from "react"

interface OrderStatusAnimationProps {
  status: string
}

export function OrderStatusAnimation({ status }: OrderStatusAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Animation variables
    let particles: any[] = []
    let cups: any[] = []

    // Create particles based on status
    const createParticles = () => {
      particles = []

      if (status === "placed") {
        // Create order placed particles
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: "#f59e0b",
            speed: Math.random() * 2 + 1,
            direction: Math.random() * Math.PI * 2,
          })
        }
      } else if (status === "preparing") {
        // Create steam particles for preparing
        for (let i = 0; i < 30; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() * 40 - 20),
            y: canvas.height / 2 + 10,
            radius: Math.random() * 2 + 1,
            color: "rgba(255, 255, 255, 0.7)",
            speed: Math.random() * 1 + 0.5,
            life: Math.random() * 100 + 50,
          })
        }
      } else if (status === "ready") {
        // Create celebration particles
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            radius: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 60 + 20}, 100%, 50%)`,
            speed: Math.random() * 3 + 2,
            life: Math.random() * 100 + 100,
          })
        }
      }
    }

    // Create coffee cup
    const createCup = () => {
      cups = [
        {
          x: canvas.width / 2,
          y: canvas.height / 2,
          width: 40,
          height: 50,
          color: "#92400e",
        },
      ]
    }

    // Draw functions
    const drawParticles = () => {
      particles.forEach((p, index) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Update particle position
        if (status === "placed") {
          p.x += Math.cos(p.direction) * p.speed
          p.y += Math.sin(p.direction) * p.speed

          // Bounce off walls
          if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction
          if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction
        } else if (status === "preparing") {
          p.y -= p.speed
          p.life--

          if (p.life <= 0) {
            // Reset particle
            p.y = canvas.height / 2 + 10
            p.x = canvas.width / 2 + (Math.random() * 40 - 20)
            p.life = Math.random() * 100 + 50
          }
        } else if (status === "ready") {
          p.y -= p.speed
          p.life--

          if (p.life <= 0) {
            // Reset particle
            p.y = canvas.height + 10
            p.x = Math.random() * canvas.width
            p.life = Math.random() * 100 + 100
          }
        }
      })
    }

    const drawCup = () => {
      cups.forEach((cup) => {
        // Draw cup body
        ctx.fillStyle = cup.color
        ctx.fillRect(cup.x - cup.width / 2, cup.y - cup.height / 2, cup.width, cup.height)

        // Draw cup handle
        ctx.beginPath()
        ctx.arc(cup.x + cup.width / 2 + 10, cup.y, cup.height / 3, -Math.PI / 2, Math.PI / 2)
        ctx.strokeStyle = cup.color
        ctx.lineWidth = 5
        ctx.stroke()

        // Draw coffee inside
        ctx.fillStyle = "#92400e"
        ctx.fillRect(cup.x - cup.width / 2 + 5, cup.y - cup.height / 2 + 5, cup.width - 10, 15)
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawParticles()

      if (status === "preparing" || status === "ready") {
        drawCup()
      }

      requestAnimationFrame(animate)
    }

    // Initialize
    createParticles()
    createCup()
    animate()

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 200
      createParticles()
      createCup()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [status])

  return <canvas ref={canvasRef} className="w-full h-[200px] bg-amber-900/10 rounded-lg" />
}

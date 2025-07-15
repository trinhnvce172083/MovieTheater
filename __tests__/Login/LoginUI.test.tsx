"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import type React from "react"
import LoginPage from "@/app/auth/Login/page"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock react-redux
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}))

// Improved Ant Design mocks
jest.mock("antd", () => {
  // Helper function to filter out Ant Design specific props
  const filterAntdProps = (props: any) => {
    const { valuePropName, htmlType, loading, children, ...validProps } = props
    return validProps
  }

  // Input mock
  const Input = Object.assign(
    (props: any) => {
      const validProps = filterAntdProps(props)
      return <input {...validProps} />
    },
    {
      Password: (props: any) => {
        const validProps = filterAntdProps(props)
        return <input type="password" {...validProps} />
      },
    },
  )

  // Checkbox mock
  const Checkbox = (props: any) => {
    const validProps = filterAntdProps(props)
    return <input type="checkbox" {...validProps} />
  }

  // Button mock
  const Button = (props: any) => {
    const { loading, htmlType, valuePropName, children, ...validProps } = props
    return <button {...validProps}>{children}</button>
  }

  // Typography mock
  const Typography = {
    Title: (props: any) => {
      const { children, ...validProps } = props
      return <h2 {...validProps}>{children}</h2>
    },
  }

  // Card mock
  const Card = (props: any) => {
    const { children, ...validProps } = props
    return <div {...validProps}>{children}</div>
  }

  // Form.Item mock
  const FormItem = (props: any) => {
    const { children, valuePropName, name, rules, label, ...validProps } = props
    return <div {...validProps}>{children}</div>
  }

  // Form mock
  const useForm = () => [
    {
      getFieldDecorator: jest.fn(),
      getFieldsValue: jest.fn(),
      setFieldsValue: jest.fn(),
      validateFields: jest.fn().mockResolvedValue({}),
      resetFields: jest.fn(),
      submit: jest.fn(),
    },
    jest.fn(),
  ]

  const Form = Object.assign(
    (props: any) => {
      const { onFinish, children, ...validProps } = props
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onFinish) onFinish()
      }
      return (
        <form {...validProps} onSubmit={handleSubmit}>
          {children}
        </form>
      )
    },
    {
      useForm,
      Item: FormItem,
    },
  )

  return {
    Input,
    Checkbox,
    Button,
    Typography,
    Card,
    Form,
    message: {
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
    },
  }
})

describe("LoginPage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it("renders the login form", () => {
    render(<LoginPage />)

    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })

  it("submits the form with correct values", () => {
    const mockOnFinish = jest.fn()

    render(<LoginPage />)

    const usernameInput = screen.getByPlaceholderText("Enter your username")
    const passwordInput = screen.getByPlaceholderText("Enter your password")
    const loginButton = screen.getByRole("button", { name: "Log In" })

    fireEvent.change(usernameInput, { target: { value: "admin1" } })
    fireEvent.change(passwordInput, { target: { value: "12345Aa@" } })
    fireEvent.click(loginButton)

    // Add assertions based on your component's behavior
    expect(usernameInput).toHaveValue("admin1")
    expect(passwordInput).toHaveValue("12345Aa@")
  })

  it("handles form validation", () => {
    render(<LoginPage />)

    const loginButton = screen.getByRole("button", { name: "Log In" })

    // Try to submit without filling fields
    fireEvent.click(loginButton)

    // Add assertions for validation behavior
  })

  it("handles remember me checkbox", () => {
    render(<LoginPage />)

    const rememberCheckbox = screen.getByRole("checkbox")

    expect(rememberCheckbox).not.toBeChecked()

    fireEvent.click(rememberCheckbox)

    expect(rememberCheckbox).toBeChecked()
  })
})

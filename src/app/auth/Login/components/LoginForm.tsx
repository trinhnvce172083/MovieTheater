import React from "react";
import { Button, Form, Input, Checkbox, FormInstance } from "antd";
import { LoginFormValues } from "@/types/Login/LoginFormValues";

interface LoginFormProps {
  loading: boolean;
  onFinish: (values: LoginFormValues) => void;
  form: FormInstance;
}

const LoginForm = React.memo<LoginFormProps>(function LoginForm({ loading, onFinish, form }) {
  const formItems = [
    {
      key: "username-field",
      label: "Username",
      name: "username",
      rules: [{ required: true, message: "Please input your username!" }],
      component: (
        <Input
          size="large"
          placeholder="Enter your username"
          className="rounded-lg text-shadow-gray-950! autofill:bg-transparent sm:text-base text-sm"
          autoComplete="new-username"
        />
      ),
    },
    {
      key: "password-field",
      label: "Password",
      name: "password",
      rules: [{ required: true, message: "Please input your password!" }],
      component: (
        <Input.Password
          size="large"
          placeholder="Enter your password"
          className="rounded-lg text-gray-950! autofill:bg-transparent sm:text-base text-sm"
          autoComplete="new-password"
        />
      ),
    },
    {
      key: "remember-me-field",
      name: "rememberMe",
      valuePropName: "checked",
      component: <Checkbox className="sm:text-base text-sm">Remember me</Checkbox>,
    },
  ];

  return (
    <Form
      name="login"
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      form={form}
    >
      {formItems.map((item) => (
        <Form.Item
          key={item.key}
          label={item.label}
          name={item.name}
          rules={item.rules}
          valuePropName={item.valuePropName}
        >
          {item.component}
        </Form.Item>
      ))}
      <Form.Item key="submit-button-field">
        <Button
          type="primary"
          htmlType="submit"
          className="w-full mt-1 sm:mt-2 sm:text-base text-sm"
          size="large"
          loading={loading}
        >
          Log In
        </Button>
      </Form.Item>
    </Form>
  );
});

export default LoginForm;

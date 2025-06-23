import { Button, Form, Input, Checkbox, FormInstance } from "antd";
import { LoginFormValues } from "@/types/Login/LoginFormValues";

interface LoginFormProps {
  loading: boolean;
  onFinish: (values: LoginFormValues) => void;
  form: FormInstance;
}

const LoginForm: React.FC<LoginFormProps> = ({ loading, onFinish, form }) => (
  <Form
    name="login"
    layout="vertical"
    onFinish={onFinish}
    autoComplete="off"
    form={form}
  >
    <Form.Item
      label="Username"
      name="username"
      rules={[{ required: true, message: "Please input your username!" }]}
    >
      <Input size="large" placeholder="Enter your username" className="rounded-lg" />
    </Form.Item>
    <Form.Item
      label="Password"
      name="password"
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Input.Password
        size="large"
        placeholder="Enter your password"
        className="rounded-lg"
      />
    </Form.Item>
    <Form.Item name="rememberMe" valuePropName="checked">
      <Checkbox>Remember me</Checkbox>
    </Form.Item>
    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        className="w-full mt-2"
        size="large"
        loading={loading}
      >
        Log In
      </Button>
    </Form.Item>
  </Form>
);

export default LoginForm;
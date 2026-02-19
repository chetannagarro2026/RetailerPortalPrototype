import { Modal, Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await loginWithCredentials(values.username, values.password);
      message.success('Signed in');
      onClose();
    } catch (err: any) {
      message.error(err?.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} title="Sign in" onCancel={onClose} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input autoComplete="username" />
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

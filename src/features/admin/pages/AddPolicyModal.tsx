import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, ColorPicker } from 'antd';
import { Shield, Info, Edit3, Type, Palette, Activity, FileText } from 'lucide-react';
import { Policy } from '../../../types/polices';

interface AddPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  loading: boolean;
  editingPolicy?: Policy | null;
  isNotice?: boolean;
}

export default function AddPolicyModal({ visible, onClose, onSave, loading, editingPolicy, isNotice }: AddPolicyModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && editingPolicy) {
      form.setFieldsValue({
        title: editingPolicy.title,
        description: editingPolicy.description,
        content: editingPolicy.content,
        icon: editingPolicy.icon,
        color: editingPolicy.color,
        active: editingPolicy.active,
      });
    } else if (visible && !editingPolicy) {
      form.resetFields();
      form.setFieldsValue({ active: true, color: '#4f46e5', icon: 'shield' });
    }
  }, [visible, editingPolicy, form]);

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      color: typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#4f46e5',
    };
    
    // If it's a notice, we ensure we only send what's allowed
    if (isNotice) {
      const noticeData = {
        title: formattedValues.title,
        content: formattedValues.content || formattedValues.description, // Fallback if user filled description
        active: formattedValues.active
      };
      onSave(noticeData);
    } else {
      // For normal policy, remove content if it exists to avoid validation error
      const { content, ...policyData } = formattedValues;
      onSave(policyData);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            {isNotice ? <FileText size={20} /> : <Shield size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isNotice ? 'Edit Important Notice' : (editingPolicy ? 'Edit Policy' : 'Create New Policy')}
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {isNotice ? 'This notice is visible to all instructors' : 'Manage academic guidelines and rules'}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      className="premium-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Type size={14} className="text-indigo-500" /> Title</span>}
          name="title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="e.g. Attendance Policy" className="h-11 rounded-xl" />
        </Form.Item>

        {!isNotice && (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Info size={14} className="text-indigo-500" /> Icon Name</span>}
              name="icon"
              rules={[{ required: true, message: 'e.g. shield, clock' }]}
            >
              <Input placeholder="shield, clock, book" className="h-11 rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Palette size={14} className="text-indigo-500" /> Theme Color</span>}
              name="color"
            >
              <ColorPicker showText className="w-full h-11" />
            </Form.Item>
          </div>
        )}

        {isNotice ? (
          <Form.Item
            label={<span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Edit3 size={14} className="text-indigo-500" /> Notice Content</span>}
            name="content"
            rules={[{ required: true, message: 'Please enter the notice content' }]}
          >
            <Input.TextArea placeholder="Enter the message for teachers..." rows={6} className="rounded-xl" />
          </Form.Item>
        ) : (
          <Form.Item
            label={<span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Edit3 size={14} className="text-indigo-500" /> Policy Description</span>}
            name="description"
            rules={[{ required: true, message: 'Please enter the policy description' }]}
          >
            <Input.TextArea placeholder="Enter the details of the policy..." rows={6} className="rounded-xl" />
          </Form.Item>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8">
          <Text className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity size={14} className="text-indigo-500" /> Visible & Active
          </Text>
          <Form.Item name="active" valuePropName="checked" className="mb-0">
            <Switch />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-11 px-10 rounded-xl font-bold bg-indigo-600 border-none shadow-lg shadow-indigo-200"
          >
            {isNotice ? 'Update Notice' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

import { Typography } from 'antd';
const { Text } = Typography;

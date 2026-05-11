import { Modal, Form, Input, Rate, Button, Switch } from 'antd';
import { Star, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';
import { useSendReview } from '../../../hooks/useSessions';
import { SendReviewSchedulePayload } from '../../../types/scheduales';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

export default function FeedbackModal({ visible, onClose, sessionId, sessionTitle }: FeedbackModalProps) {
  const [form] = Form.useForm();
  const { mutate: sendReview, isPending } = useSendReview();

  const handleSubmit = (values: any) => {
    const feedbackData: SendReviewSchedulePayload = {
      comment: values.comment,
      rating: values.rating,
      teacherAttended: values.teacherAttended ?? false,
      studentAttended: values.studentAttended ?? false,
    };

    sendReview({ id: sessionId, data: feedbackData }, {
      onSuccess: () => {
        onClose();
        form.resetFields();
      },
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Session Feedback</h3>
            <p className="text-xs font-medium text-slate-400">Share your feedback for: {sessionTitle}</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      className="premium-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
        initialValues={{ rating: 5, teacherAttended: true, studentAttended: true }}
      >
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8 flex flex-col items-center gap-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Rate the Session</span>
            <Form.Item name="rating" rules={[{ required: true }]} noStyle>
                <Rate className="text-3xl text-amber-400" />
            </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                        <ShieldCheck size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Teacher Attended</span>
                </div>
                <Form.Item name="teacherAttended" valuePropName="checked" noStyle>
                    <Switch size="small" />
                </Form.Item>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg">
                        <UserCheck size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Student Attended</span>
                </div>
                <Form.Item name="studentAttended" valuePropName="checked" noStyle>
                    <Switch size="small" />
                </Form.Item>
            </div>
        </div>

        <Form.Item
          label={
            <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Additional Comments</span>
            </div>
          }
          name="comment"
          rules={[{ required: true, message: 'Please share your thoughts about the session' }]}
        >
          <Input.TextArea
            placeholder="How was the session? Any specific notes or points for improvement?"
            rows={4}
            className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-slate-600 hover:text-slate-800 transition-colors">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="h-11 px-10 rounded-xl font-bold bg-blue-600 border-none shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Send Feedback
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

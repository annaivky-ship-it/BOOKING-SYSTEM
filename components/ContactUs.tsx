
import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Tag, MessageSquare, Send, LoaderCircle } from 'lucide-react';
import InputField from './InputField';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactUsProps {
  onBack: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center pt-12">
        <div className="card-base !p-12 !bg-zinc-900/50">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
            <p className="text-zinc-400 text-lg mb-8">
                Thank you for reaching out. We've received your message and will get back to you shortly.
            </p>
            <button onClick={onBack} className="btn-primary px-8 py-3">
                Return to Gallery
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="card-base !p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
        <p className="text-zinc-400 mb-8">Have a question or need assistance? Send us a message.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            icon={<User />}
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <InputField
            icon={<Mail />}
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <InputField
            icon={<Tag />}
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
          
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
            <textarea
                name="message"
                placeholder="Your Message..."
                value={formData.message}
                onChange={handleChange}
                required
                className="input-base input-with-icon h-40 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send className="h-5 w-5" />}
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;

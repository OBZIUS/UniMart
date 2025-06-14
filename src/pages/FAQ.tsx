
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import FloatingIcons from '../components/FloatingIcons';

const FAQ = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "What is UniMart?",
      answer: "Unimart is a campus market place where you can sell and buy products all inside your Uni!"
    },
    {
      question: "Can I be a seller?",
      answer: "Yes! you can list your products which will be available for everyone in the Uni for purchase!"
    },
    {
      question: "Can I make offline payment?",
      answer: "Absolutely! You can make the payment offline! just mark the deal completed on website!"
    },
    {
      question: "Is UniMart available locally?",
      answer: "No, UniMart is a campus specific program where you can trade products within your Uni."
    },
    {
      question: "Where do i contact for my queries?",
      answer: "You can always reach out to us at ourunimart@gmail.com. For business inquiries, feel free to contact our founder, Aryan Kahate, at aryankahate@gmail.com or our design lead, Shashwat Verma, at shashwatverma2911@gmail.com."
    }
  ];

  const handleGeneralSupport = () => {
    window.location.href = 'mailto:ourunimart@gmail.com?subject=General Support Query&body=Hello UniMart Team,%0A%0AI have a question regarding...';
  };

  const handleBusinessInquiry = () => {
    window.location.href = 'mailto:aryankahate@gmail.com?subject=Business Inquiry&body=Hello,%0A%0AI would like to discuss...';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="flex items-center space-x-2"
          >
            <span>←</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <h1 className="text-xl font-recoleta font-semibold text-gray-800">UniMart 🛒</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-recoleta font-bold mb-4">
            Frequently Asked
            <br />
            <span className="text-unigreen">Questions</span>
            <br />
            <span className="text-peach">& Support</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about UniMart and learn how to get the most out of our campus marketplace platform.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm">🎓</span>
              <span className="text-sm font-medium text-gray-700">Students only</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
              <span className="text-sm">✅</span>
              <span className="text-sm font-medium text-green-700">Verified deals</span>
            </div>
          </div>
        </div>

        {/* How to Get Started */}
        <div className="mb-12">
          <h2 className="text-2xl font-recoleta font-semibold text-center mb-8">How to Get Started</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-unigreen">1</span>
              </div>
              <h3 className="text-lg font-recoleta font-semibold mb-2">Upload Product</h3>
              <p className="text-gray-600 text-sm">
                Take clear photos of your item and upload them to showcase your product to potential buyers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-unigreen">2</span>
              </div>
              <h3 className="text-lg font-recoleta font-semibold mb-2">Add Product Details</h3>
              <p className="text-gray-600 text-sm">
                Fill in the product information including title, description, price, and condition to help buyers understand what you're selling
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-unigreen">3</span>
              </div>
              <h3 className="text-lg font-recoleta font-semibold mb-2">Your Product is Listed!</h3>
              <p className="text-gray-600 text-sm">
                Once submitted, your product will be live on the marketplace and visible to all students in your university
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-recoleta font-semibold text-center mb-8">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Support Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-recoleta font-semibold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">Our team is here to help you with any additional inquiries.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGeneralSupport}
              className="bg-green-100 hover:bg-green-200 text-unigreen"
            >
              General Support
            </Button>
            <Button 
              onClick={handleBusinessInquiry}
              className="bg-peach hover:bg-peach/90 text-white"
            >
              Business Inquiries
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;

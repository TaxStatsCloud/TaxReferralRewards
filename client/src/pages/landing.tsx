import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, User, Share2, Gift, Clock, ChartBar } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Navigation */}
      <nav className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-teal-500 rounded-lg p-2 mr-2">
            <i className="fas fa-chart-line text-white"></i>
          </div>
          <span className="text-xl font-semibold">ReferMint</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 mb-6">
          Earn Rewards by Sharing Your Referral Link with ReferMint!
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
          Invite friends, family, or colleagues and earn exciting rewards when they sign up and engage with our services.
        </p>
        <Link href="/register">
          <Button size="lg" className="px-8 py-6 text-lg font-medium">
            Start Referring Now
          </Button>
        </Link>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join our referral program in three simple steps and start earning rewards right away.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <Card className="bg-white border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 px-6 pb-6 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sign Up</h3>
              <p className="text-slate-600">
                Create your account with ReferMint in just a few minutes to get started.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 px-6 pb-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Share Your Link</h3>
              <p className="text-slate-600">
                Share your unique referral link with friends, family, and colleagues.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 px-6 pb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Earn Rewards</h3>
              <p className="text-slate-600">
                Get rewarded when your referrals sign up and complete certain actions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Benefits of ReferMint</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our referral program offers numerous advantages to help you maximize your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Simple Setup</h3>
                <p className="text-slate-600">Get started in minutes with our easy-to-use platform.</p>
              </div>
            </div>

            <div className="flex items-start">
              <ChartBar className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Track Your Referrals</h3>
                <p className="text-slate-600">View real-time data on how many people you've referred.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Gift className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Earn Rewards</h3>
                <p className="text-slate-600">Get monetary or credit-based rewards for successful referrals.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Special Campaigns</h3>
                <p className="text-slate-600">Take advantage of time-limited campaigns with boosted rewards.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Easy Sharing</h3>
                <p className="text-slate-600">Share your referral link via email, social media, or QR code.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Milestone Rewards</h3>
                <p className="text-slate-600">Unlock special bonuses when you reach referral milestones.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Success Stories</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hear from people who have already found success with our referral program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                "I've earned over $500 in just two months by referring my colleagues to ReferMint. The tracking system makes it easy to see my progress."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white">
                  <span>JD</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900">Jane Doe</p>
                  <p className="text-sm text-slate-500">Marketing Specialist</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                "The milestone rewards are a great incentive. I just reached my 10th referral and received a nice bonus on top of the regular rewards."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <span>JS</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900">John Smith</p>
                  <p className="text-sm text-slate-500">Sales Representative</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                "I love how easy it is to share my referral link through social media. The QR code option is perfect for in-person networking events."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <span>AJ</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900">Amy Johnson</p>
                  <p className="text-sm text-slate-500">Business Consultant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning Rewards?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join our referral program today and turn your network into rewards.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg font-medium">
              Start Referring Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-teal-500 rounded-lg p-2 mr-2">
                  <i className="fas fa-chart-line text-white"></i>
                </div>
                <span className="text-xl font-semibold text-white">ReferMint</span>
              </div>
              <p className="text-sm">
                Turn your network into rewards with our easy-to-use referral program.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/">
                    <a className="hover:text-white transition-colors">Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <a className="hover:text-white transition-colors">Login</a>
                  </Link>
                </li>
                <li>
                  <Link href="/register">
                    <a className="hover:text-white transition-colors">Sign Up</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Cookies Policy</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i>
                  <a href="mailto:support@refermint.com" className="hover:text-white transition-colors">
                    support@refermint.com
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-2"></i>
                  <span>(555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} ReferMint. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
'use client'

import { Bell, Settings, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
    user?: {
        name: string
        email: string
    }
}

export function Header({ user }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const navigationItems = [
        { name: 'Account Information', href: '/account' },
        { name: 'History', href: '/history' },
        { name: 'Booked ticket', href: '/booked' },
        { name: 'Managed ticket', href: '/managed' },
    ]

    return (
        <header className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-none mx-auto px-6">
                <div className="flex items-center justify-between h-14">

                    {/* Logo/Brand Section */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">MT</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <div className="flex flew-row items-center space-x-3">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`px-4 py-1.5 rounded-full text-sm font-normal transition-all duration-200 ${isActive
                                            ? 'bg-black text-white shadow-sm'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Right Section - User Info & Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Notification Icon */}
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>

                        {/* Settings Icon */}
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>

                        {/* User Info */}
                        {user && (
                            <div className="hidden md:flex items-center space-x-2 ml-2">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900 leading-tight">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-gray-500 leading-tight">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center ml-1">
                                    <User className="w-3.5 h-3.5 text-gray-600" />
                                </div>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive
                                            ? 'bg-black text-white'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                )
                            })}

                            {/* Mobile User Info */}
                            {user && (
                                <div className="pt-4 pb-3 border-t border-gray-100">
                                    <div className="flex items-center px-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
} 
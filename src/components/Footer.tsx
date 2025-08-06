import Image from "next/image";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12">
      {/* Bottom Section - Company Info */}
      <div className="border-t border-gray-700 pt-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/6 mb-6 md:mb-0">
            <Image
              src="/Logo.png"
              alt="Cinema Logo"
              width={120}
              height={80}
              className="w-auto h-12"
            />
          </div>
          <div className="md:w-5/6 text-sm">
            <h3 className="text-base uppercase font-semibold mb-3">
              LUMIERE CINEMA COMPANY
            </h3>
            <p className="mb-2">
              <EnvironmentOutlined className="mr-2" />
              F-Town 1 Building, Lot T2, D1 Street, Saigon Hi-Tech Park, Tan Phu
              Ward, Thu Duc City, Ho Chi Minh City, Vietnam
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center" role="contentinfo">
                <PhoneOutlined className="mr-2" /> 0399.927.256
              </div>
              <div className="flex items-center" role="contentinfo">
                <MailOutlined className="mr-2" /> gundneit@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

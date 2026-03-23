import React from "react";
import { ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react";

export const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}) => {
  const colorStyles = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>

        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center text-sm">
          {changeType === "up" ? (
            <span className="flex items-center text-emerald-600 font-medium">
              <ArrowUpRightIcon className="w-4 h-4 mr-1" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-red-600 font-medium">
              <ArrowDownRightIcon className="w-4 h-4 mr-1" />
              {change}
            </span>
          )}

          <span className="text-gray-400 ml-2">so với tháng trước</span>
        </div>
      )}
    </div>
  );
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TripType = ({ className, headerClassName, titleClassName, toggleButtonClassName, optionsClassName, optionClassName, selectedOptionClassName, iconClassName, nameClassName, }) => {
    const [showOptions, setShowOptions] = (0, react_1.useState)(false);
    const [selectedTripType, setSelectedTripType] = (0, react_1.useState)('individuel');
    const tripTypeOptions = [
        { id: 'individuel', name: 'Individuel', icon: '👤', color: '#3498db' },
        { id: 'ramassage', name: 'Ramassage', icon: '👥', color: '#9b59b6' },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsxs)("div", { className: headerClassName, children: [(0, jsx_runtime_1.jsx)("h3", { className: titleClassName, children: "Type de trajet" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowOptions(!showOptions), className: toggleButtonClassName, children: showOptions ? 'Réduire' : 'Options' })] }), showOptions && ((0, jsx_runtime_1.jsx)("div", { className: optionsClassName, children: tripTypeOptions.map((option) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedTripType(option.id), className: `${optionClassName} ${selectedTripType === option.id ? selectedOptionClassName : ''}`, style: {
                        backgroundColor: selectedTripType === option.id ? option.color : undefined,
                    }, children: [(0, jsx_runtime_1.jsx)("span", { className: iconClassName, children: option.icon }), (0, jsx_runtime_1.jsx)("span", { className: nameClassName, children: option.name })] }, option.id))) }))] }));
};
exports.default = TripType;

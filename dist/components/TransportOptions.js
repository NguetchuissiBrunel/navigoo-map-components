"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TransportOptions = ({ className, headerClassName, titleClassName, toggleButtonClassName, optionsClassName, optionClassName, selectedOptionClassName, iconClassName, nameClassName, }) => {
    const [showOptions, setShowOptions] = (0, react_1.useState)(false);
    const [selectedTransport, setSelectedTransport] = (0, react_1.useState)('taxi');
    const transportOptions = [
        { id: 'taxi', name: 'Taxi', icon: '🚕', color: '#3498db' },
        { id: 'bus', name: 'Bus', icon: '🚌', color: '#2980b9' },
        { id: 'moto', name: 'Moto', icon: '🏍️', color: '#1abc9c' },
    ];
    (0, react_1.useEffect)(() => {
        window.dispatchEvent(new CustomEvent('transportChange', { detail: selectedTransport }));
    }, [selectedTransport]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsxs)("div", { className: headerClassName, children: [(0, jsx_runtime_1.jsx)("h3", { className: titleClassName, children: "Moyen de transport" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowOptions(!showOptions), className: toggleButtonClassName, children: showOptions ? 'Réduire' : 'Options' })] }), showOptions && ((0, jsx_runtime_1.jsx)("div", { className: optionsClassName, children: transportOptions.map((option) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedTransport(option.id), className: `${optionClassName} ${selectedTransport === option.id ? selectedOptionClassName : ''}`, style: {
                        backgroundColor: selectedTransport === option.id ? option.color : undefined,
                    }, children: [(0, jsx_runtime_1.jsx)("span", { className: iconClassName, children: option.icon }), (0, jsx_runtime_1.jsx)("span", { className: nameClassName, children: option.name })] }, option.id))) }))] }));
};
exports.default = TransportOptions;

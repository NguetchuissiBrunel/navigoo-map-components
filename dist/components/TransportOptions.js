"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
const TransportOptions = () => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.optionsSection, children: [(0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.optionsHeader, children: [(0, jsx_runtime_1.jsx)("h3", { className: styles_module_css_1.default.optionsTitle, children: "Moyen de transport" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowOptions(!showOptions), className: styles_module_css_1.default.toggleButton, children: showOptions ? 'Réduire' : 'Options' })] }), showOptions && ((0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.transportOptions, children: transportOptions.map((option) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedTransport(option.id), className: `${styles_module_css_1.default.transportOption} ${selectedTransport === option.id ? styles_module_css_1.default.selected : ''}`, style: {
                        backgroundColor: selectedTransport === option.id ? option.color : undefined,
                    }, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.transportIcon, children: option.icon }), (0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.transportName, children: option.name })] }, option.id))) }))] }));
};
exports.default = TransportOptions;

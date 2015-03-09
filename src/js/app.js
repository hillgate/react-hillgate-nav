var React = require('react');
window.React = React;

var Nav = require('../../index.jsx');
React.renderComponent(Nav(), document.querySelector('.here'));

var _ = require('lodash');
var moment = require('moment');
var React = require('react');
var request = require('superagent')

var cdnUrl = 'http://d34i3ar4bnnqdn.cloudfront.net';
var marketingUrl = 'http://localhost:5000';
var apiUrl = 'http://localhost:5000';

var logoImg = '/img/hillgate-gray-100.png';
var defaultAvatar = 'https://res.cloudinary.com/wemeetup/image/upload/v1364306561/user_uwcrts.jpg';
var loggedOutButtons = [
  {key: 'signup', url: marketingUrl + "/sign-up", label: "Sign Up"},
  {key: 'login', url: marketingUrl + "/login", label: "Log In"}
];
var loggedOutLinks = [
  {key: 'why', url: marketingUrl + "/home#why-use-hillgate", label: "Why use Hillgate"},
  {key: 'how', url: marketingUrl + "/home#how-does-hillgate-work", label: "How it works"},
  {key: 'consultants', url: marketingUrl + "/home#our-consultants", label: "Our consultants"},
  {key: 'cases', url: marketingUrl + "/home#case-studies", label: "Case studies"}
];
var loggedInLinks = [
  {key: 'dashboard', url: "/dashboard", label: "Dashboard", icon: 'dashboard'},
  {key: 'profile', url: "/my-profile", label: "My profile", icon: 'user'},
  {key: 'settings', url: "/account-settings", label: "Account settings", icon: 'gear'}
];
var adminLinks = [
  {key: 'members', url: "/members", label: "Members"},
  {key: 'applications', url: "/applications", label: "Applications"},
  {key: 'newProject', url: "/new-project", label: "New project"},
  {key: 'companies', url: "/companies", label: "Companies"},
  {key: 'discountCodes', url: "/discount-codes", label: "Discount codes"},
];

var Nav = React.createClass({
  render: function() {
    return (
      <nav className="Nav">
        <div className="u-container-fluid">
          <div className = "Arrange Arrange--middle">
            <NavLogo />
            <NavRight />
          </div>
        </div>
      </nav>
    );
  }
});

var NavLogo = React.createClass({
  render: function() {
    return (
      <div className="Nav-Logo Arrange-sizeFit">
        <a href={marketingUrl}>
          <img src={cdnUrl + logoImg} className="HeaderLogo"/>
        </a>
      </div>
    );
  }
});

var NavRight = React.createClass({
  getInitialState: function() {
    return {data: {loggedIn: null}};
  },
  componentDidMount: function() {
    request
      .get(apiUrl + '/api/ping')
      .withCredentials()
      .end((function(_this) {
        return function(err, response) {
          if (err) {
            _this.setState({data: {loggedIn: false}});
          } else {
            _this.setState({data: response.body});
          }
        };
      })(this));
  },
  render: function() {

    // This leaves a null value for the component if loggedIn is null so that
    // we have nothing rendered until the XHR request completes.
    var navRightComponent = null;
    if (this.state.data.loggedIn === true) {
      navRightComponent = <NavRightLoggedIn data={this.state.data} />;
    } else if (this.state.data.loggedIn === false) {
      navRightComponent = <NavRightLoggedOut />;
    }

    return (
      <div className="Nav-Right Arrange-sizeFill">
        {navRightComponent}
      </div>
    );
  }
});

var NavRightLoggedOut = React.createClass({
  render: function() {
    var buttons = loggedOutButtons.map(function(item) {
      return (<ListItem key={item.key} url={item.url} label={item.label} classNames = "Button Button--Nav"/>);
    });
    var links = loggedOutLinks.map(function(item) {
      return (<ListItem key={item.key} url={item.url} label={item.label} />);
    });
    var hiddenLinks = loggedOutLinks.map(function(item) {
      return (<ListItem key={"hidden"+item.key} url={item.url} label={item.label} />);
    });
    return (
      <div className="Nav-Right-LoggedOut">
        <ul>
          {buttons}
        </ul>
        <ul className="u-sm-hidden u-md-hidden">
          {links}
        </ul>
        <ul className="u-lg-hidden">
          <li>
            <DropComponent position="bottom right">
              <a className="Drop-Target Button Button--Nav Button--Round">
                <i className="fa fa-bars"></i>
              </a>
              <div className="Drop-Content u-hidden">
                <ul className="DropdownMenu">
                  {hiddenLinks}
                </ul>
              </div>
            </DropComponent>
          </li>
        </ul>
      </div>
    );
  }
});

var NavRightLoggedIn = React.createClass({
  render: function() {
    var data = this.props.data;
    var adminDrop = (data.isAdmin) ? <NavAdminItem /> : null;
    return (
      <div className="Nav-Right-LoggedIn u-cf">
        <ul>
          <NavUserItem profilePicture={data.user.profilePicture}/>
          <NavMessageItem unreadMessages={data.user.unreadMessages}/>
          {adminDrop}
        </ul>
      </div>
    );
  }
});

var NavMessageItem = React.createClass({
  render: function() {

    // // Unread message count goes in a badge
    // var badge = null;
    // if (this.props.unreadMessages.length > 0) {
    //   badge = <span className="Badge">{this.props.unreadMessages.length}</span>
    // };
    //
    // // Unread messages are listed in a dropbox with a link to all messages.
    // var messageItems = this.props.unreadMessages.map(function (message) {
    //   return (
    //     <NavMessageItem message={message} />
    //   );
    // });
    // messageItems.push([(<li><a href="#">View All Messages</a></li>)]);
    // <i className="fa fa-lg fa-envelope-o"></i>
    // {badge}
    // </a>
    // <ul className="dropdown-menu" role="menu">
    //   {messageItems}
    // </ul>
    return (
      <li>
        <DropComponent position="bottom right">
          <a className="Drop-Target Button Button--Nav Button--Round">
            <i className="fa fa-lg fa-envelope-o"></i>
          </a>
          <div className="Drop-Content u-hidden">
            <ul className="DropdownMenu">

              <li className="DropdownMenu-Divider"></li>
              <ListItem
                key="logout1"
                url="/logout"
                label="Sign out"
                iconName="power-off"
                />
            </ul>
          </div>
        </DropComponent>
      </li>
    );
  }
});

// var NavMessageItem = React.createClass({
//   render: function() {
//     var formattedDate = moment(this.props.message.sentDate).format('ll');
//     return (
//       <li>
//         <a href={"/messages/" + this.props.message.senderId}>
//           <div className="NavMessageItem">
//             <div className="NavMessageItem--Header">
//               {this.props.message.senderDisplayName}
//               <div className="NavMessageItem--Date">{formattedDate}</div>
//             </div>
//             <div className="NavMessageItem--Body">
//               <span className="fa-stack fa-lg">
//                 <i className="fa fa-circle fa-stack-2x"></i>
//                 <i className="fa fa-quote-right fa-stack-1x fa-inverse"></i>
//               </span>{' '}
//               {this.props.message.body}
//             </div>
//           </div>
//         </a>
//       </li>
//     );
//   }
// });

var NavUserItem = React.createClass({
  render: function() {

    var avatarUrl = this.props.profilePicture || defaultAvatar;
    var links = loggedInLinks.map(function(item) {
      return (
        <ListItem
          key={item.key}
          url={item.url}
          label={item.label}
          iconName={item.icon}/>
      );
    });
    return (
      <li>
        <DropComponent position="bottom right">
          <a className="Drop-Target Button Button--Nav Button--Round">
            <img className="Avatar" src={avatarUrl} />
          </a>
          <div className="Drop-Content u-hidden">
            <ul className="DropdownMenu">
              {links}
              <li className="DropdownMenu-Divider"></li>
              <ListItem
                key="logout1"
                url="/logout"
                label="Sign out"
                iconName="power-off"
                />
            </ul>
          </div>
        </DropComponent>
      </li>
    );
  }
});

var NavAdminItem = React.createClass({
  render: function() {
    var links = adminLinks.map(function(item) {
      return (
        <ListItem
          key={item.key}
          url={item.url}
          label={item.label}/>
      );
    });
    return (
      <li>
        <DropComponent position="bottom right">
          <a className="Drop-Target Button Button--Nav Button--Admin">
          <i className="fa fa-glass"></i> Admin
          </a>
          <div className="Drop-Content u-hidden">
            <ul className="DropdownMenu">
              {links}
            </ul>
          </div>
        </DropComponent>
      </li>
    );
  }
});

var ListItem = React.createClass({
  render: function() {
    var icon = null;
    if (this.props.iconName) {
      icon = (
        <span><i className={"fa fa-fw fa-" + this.props.iconName}></i> </span>
      );
    }
    return (
      <li>
        <a href={this.props.url} className={this.props.classNames}>
          {icon}
          {this.props.label}
        </a>
      </li>
    )
  }
});

var DropComponent = React.createClass({
  componentDidMount: function() {
    drop = new Drop({
      target: this.getDOMNode().querySelector('.Drop-Target'),
      content: this.getDOMNode().querySelector('.Drop-Content').innerHTML,
      classes: 'drop-theme-arrows-bounce',
      position: this.props.position
    });
  },
  render: function() {
    return(<div className="Drop">{this.props.children}</div>);
  }
});

module.exports = Nav;

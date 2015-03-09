var targetSelector = '.js-dropTarget';
var contentSelector = '.js-dropContent ul';

var Drop = React.createClass({
  displayName: "Drop",
  componentDidMount: function() {
    var $target = this.getDOMNode().querySelector(targetSelector);
    var $content = this.getDOMNode().querySelector(contentSelector);
    var $otherDrops = $(contentSelector).not($content);

    // Hide the target drop initially
    $($content).hide();

    $($target).click(function(e) {

      // Hide any other drops
      if ($($otherDrops).is(':visible')) {
  			$($otherDrops).slideUp(150);
  			$($target).removeClass('is-active');
  		}

      // Target the target drop
      $($content).slideToggle(150);
			$($target).toggleClass('is-active');
			e.stopPropagation();
		});

    // Hide the target drop on click outside the target
		$(document).click(function() {
  		if ($($content).is(':visible')) {
  			$($content, this).slideUp(150);
  			$($target).removeClass('is-active');
  		}
		});
  },
  render: function() {
    return(<div className="Drop">{this.props.children}</div>);
  }
});

module.exports = Drop;

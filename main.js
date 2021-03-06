( function( $ ) {

function colorComment( $commentPanel ) {
	var heading = $commentPanel.find( '.commentPanelMessage p' ).eq( 0 ).text()
		// for newer gerrit versions
		|| $commentPanel.find( '.com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-summary' ).text(),
		color = '#aaa';

	if ( heading.match( /Code\-Review\-2[$\n]/ ) || heading.match( /Verified\-2[$\n]/ ) ) {
		color = '#C90505';
	} else if ( heading.match( /Code\-Review\-1[$\n]/ ) || heading.match( /Verified\-1[$\n]/ ) ) {
		color = 'red';
	} else if ( heading.match( /Code\-Review\+1[$\n]/ ) ) {
		color = 'yellow';
	} else if ( heading.match( /Code\-Review\+2[$\n]/ ) ) {
		color = 'green';
	}
	$commentPanel.css( {
		'border-left': 'solid 10px ' + color,
		'border-top-left-radius': 0,
		'border-bottom-left-radius': 0
	} );
}

function updateReviewList() {
	// change the style of all rows to reflect the patchset current score
	$( '.changeTable tr' ).each( function() {
		var color, className;
		// Any negative score make it red
		if ( $( this ).find( '.negscore.singleLine' ).length > 0 ) {
			className = 'negscore';
			color = 'red';
		} else {
			className = false;
			icon = $( this ).find( '.cAPPROVAL .gwt-Image' );
			if ( icon && icon.attr( 'src' ) ) {
				// omg forgive me. Relying on data uri to tell if an X is present
				if ( icon.attr( 'src' ).indexOf( '9en6Fj4TxzxvPC/Uw2G2MEXjV//kEpgRFM89AAAAABJRU5ErkJggg==' ) > -1 ) {
					className = 'negscore';
					color = 'red';
				// check for 2 images now knowing that neither is an X
				} else if (
					// two ticks
					$( this ).find( '.cAPPROVAL .gwt-Image' ).length === 2 ||
					// one tick and a +1
					( $( this ).find( '.cAPPROVAL .gwt-Image' ).length === 1 &&
						$( this ).find( '.posscore.singleLine' ).length === 1 ) ) {
					className = 'posscore';
					color = '#08a400';
				}
			}
		}
		if ( className ) {
			$( this ).find( 'td' ).each( function() {
				if ( !$( this ).hasClass( 'iconCell' ) ) {
					$( this ).addClass( className + ' dataCell' ).
						find( 'a' ).attr( 'style', 'color: ' + color + ' !important;' ); // ergg WHY GERRIT WHY?!!
				}
			} );
		}
	} );
}

function listener( ev ) {
	var icon, style,
		$t = $( ev.target ), $owner, author, action;

	// if ( $t.hasClass( 'com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-messageBox' ) ) {
	// 	colorComment( $t );
	// } else if ( $t.hasClass( 'commentPanel' ) ) { // force open comment panel
	// 	author = $t.find( '.commentPanelAuthorCell' ).text();
	// 	action = $t.find( '.commentPanelSummary' ).text();
	// 	if ( author === 'jenkins-bot' ||
	// 		action.indexOf( 'Uploaded patch set' ) === 0  ||
	// 		action.match( /was rebased$/ ) ) {
	// 		 // make jenkins comments less prominent
	// 		$t.find( '.commentPanelHeader' ).css( 'opacity', 0.6 );
	// 	} else {
	// 		$t.find( '.commentPanelContent' ).show();
	// 	}
	// 	colorComment( $t );
	// } else if ( $t.hasClass( 'gwt-DisclosurePanel' ) ) { // open patchset
	// 	$( '.gwt-DisclosurePanel-closed tbody tr' ).trigger( 'click' ); // HACK! not optimal
	// } else
	if ( $t.children( '.changeTable' ).length > 0 ) {

		var comments = 0;
		$t.find( '.changeTable .commentCell' ).each( function() { // count comments
			var text = $( this ).text(), newCount;
			if ( text ) { // not empty
				text = text.replace( ' comment' ); // errgg hacky sorry
				newCount = parseInt( text, 10 );
				if ( !isNaN( newCount ) ) { // check we got a number
					comments += newCount; // add it to the count
				}
			}
		} );
		$owner = $t.parents( '.gwt-DisclosurePanel' );
		$( '<a class="downloadLink">' ).text( comments + ' comments' ).
			appendTo( $owner.find( 'tr' ).eq( 0 ).find( 'td' ).eq( 2 ) );
		$owner.find( 'tbody tr' ).trigger( 'click' );
	} else if ( $t.hasClass( 'gwt-Image' ) ) {
		var dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA4ElEQVR42tXSPQqDQBQEYIvc2zIIEgvFRggS0ghR1IigIFhp478oKIISPULqTHY9gSZN8rot3sfO7DLMz01d18+qqo7fACDAK8uyz5CyLLEsC9q2RRRFp91AkiSY5xnTNCHPc/i+f94FxHGMcRzR9z2GYQA967p+3QyEYbgukh5A+6BRgiCAqqqPTYDneei6DqTENQJFXNeFoij3TYBlWWiaBmmaghbqOA5kWb6xLHvYBGiati4WRQHbtiFJkrarRJJ1vb5pmhAE4bL7GUlWGIYBnufVjz6SKIrgOE5h/mbeGSmtDSosfpMAAAAASUVORK5CYII=';
		var remoteUri = 'https://gerrit.wikimedia.org/r/gerrit_ui/clear.cache.gif';
		var src = $t.attr( 'src' );
		// hacky way of detecting page load on my reviews page
		// the icon to the left of the review load is the last thing loaded.
		// In Gerrit versions it could either be a gif of a data uri
		if ( src === remoteUri || src === dataUri ) {
			updateReviewList();
		}
	}
}
document.addEventListener( 'DOMNodeInserted', listener, false );

} )( jQuery );

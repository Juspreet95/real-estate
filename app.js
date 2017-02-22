//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

function callLeboncoin() {

    var url = 'https://www.leboncoin.fr/ventes_immobilieres/1084457186.htm?ca=12_s'



    request( url, function ( error, response, html ) {

        if ( !error && response.statusCode == 200 ) {



            var $ = cheerio.load( html )



            var lbcDataArray = $( 'section.properties span.value' )



            var lbcData = {

                price: parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),

                city: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ),

                type: $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase(),

                surface: parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )

            }



            console.log( lbcData )



        }

        else {

            console.log( error )

        }

    })

}

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory

app.get( '/call', function ( req, res ) {

    callLeboncoin( function ( lbcData ) {
        callMeilleurAgent( lbcData, function ( maData ) {
            estimation( lbcData, function ( estimationData ) {
                comparer( lbcData, maData, estimationData, res )
            })

        })
    });


    var url = req.query.urlLBC

    res.render( 'home', {
        message: 'The Home Page!',
        link: url
    });
});

//recupérer les données sur leboncoin
function callLeboncoin( receivedLBCData ) {
    var urlLBC = 'https://www.leboncoin.fr/ventes_immobilieres/1062847924.htm?ca=12_s'

    request( urlLBC, function ( error, response, html ) {
        console.log( response.statusCode );
        if ( !error && response.statusCode == 200 ) {

            var $ = cheerio.load( html )

            var lbcDataArray = $( 'section.properties span.value' );
            let lbcData = {
                price: parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                city: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ),
                type: $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase(),
                surface: parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )
            }
            console.log( lbcData )
            receivedLBCData( lbcData )
        }
        else {
            console.log( error );
        }
    })
}

function estimation( surfaceLBC, prixLBC ) {
    let prixM2_LBC = {
        Estimation_M2_Price: parseInt( prixLBC / surfaceLBC )
    }
    console.log( prixM2_LBC )

}

//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

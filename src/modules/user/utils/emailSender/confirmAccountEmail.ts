export function confirmAccountEmailModel(name: string, token: string): string {
  return `<!DOCTYPE html>
  <html>
  
    <head>

      <style>
        .container{
          width: 70%;
          max-width: 700px;
          margin: auto;
          text-align: center;
          font-family: sans-serif;
        
        }

        .btn{
          border: none;
          border-radius: 5px;
          width: 70%;
          padding: 10px;
          font-weight: bold;
          font-size: 20px;
          color: white;
          background-color: rgb(39, 41, 43);
        }

        .btn:hover{
          filter: brightness(1.4);
          cursor: pointer;
        }

        .subtext{
          font-size: 12px;
        }
      </style>
    </head>
  
    <body>
      <div class="container">
        <h2>Account confirmation</h2>
        <p>Hello, ${name}! Click on the button to confirm your registration. If you did not request this, please ignore.</p>
        <a href="${
          process.env.NODE_ENV === 'prod'
            ? process.env.FRONT_DOMAIN_PROD
            : `${process.env.FRONT_DOMAIN_DEV}:${process.env.FRONT_PORT_DEV}`
        }/confirm/${token}"><button class="btn">Confirm registration</button></a>
        <p class="subtext">The link above is valid for 2 hours.</p>
      </div>
    </body>
  
  </html>`
}

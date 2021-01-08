var nodemailer = require('nodemailer');
module.exports = zn.Middleware.ServerContext({
    methods: {
        initial: function (config, server, context){
            context.mailTransporter  = nodemailer.createTransport(
                {
                    host: "smtp.qq.com",
                    port: 465,
                    secure: true,
                    auth: {
                        type: 'custom',
                        user: 'shqzx.activity@qq.com',
                        pass: 'pivxghskfzftdcdb',
                        method: 'x-login' // force custom method instead of choosing automatically from available methods
                    },
                    logger: false,
                    debug: false, // if true then include SMTP traffic in the logs
                    customAuth: {
                        // can create multiple handlers
                        'x-login': async ctx => {
                            // This custom method implements AUTH LOGIN even though Nodemailer supports it natively.
                            // AUTH LOGIN mechanism includes multiple steps, so it's great for a demo nevertheless
        
                            console.log('Performing custom authentication for %s', ctx.auth.credentials.user);
                            console.log('Supported extensions: %s', ctx.extensions.join(', '));
                            console.log('Supported auth methods: %s', ctx.authMethods.join(', '));
        
                            if (!ctx.authMethods.includes('LOGIN')) {
                                console.log('Server does not support AUTH LOGIN');
                                throw new Error('Can not log in');
                            }
                            console.log('AUTH LOGIN is supported, proceeding with login...');
        
                            let cmd;
        
                            cmd = await ctx.sendCommand('AUTH LOGIN');
                            if (cmd.status !== 334) {
                                // expecting '334 VXNlcm5hbWU6'
                                throw new Error('Invalid login sequence while waiting for "334 VXNlcm5hbWU6"');
                            }
        
                            console.log('Sending username: %s', ctx.auth.credentials.user);
                            cmd = await ctx.sendCommand(Buffer.from(ctx.auth.credentials.user, 'utf-8').toString('base64'));
                            if (cmd.status !== 334) {
                                // expecting '334 UGFzc3dvcmQ6'
                                throw new Error('Invalid login sequence while waiting for "334 UGFzc3dvcmQ6"');
                            }
        
                            console.log('Sending password: %s', '*'.repeat(ctx.auth.credentials.pass.length));
                            cmd = await ctx.sendCommand(Buffer.from(ctx.auth.credentials.pass, 'utf-8').toString('base64'));
                            if (cmd.status < 200 || cmd.status >= 300) {
                                // expecting a 235 response, just in case allow everything in 2xx range
                                throw new Error('User failed to authenticate');
                            }
        
                            console.log('User authenticated! (%s)', cmd.response);
        
                            // all checks passed
                            return true;
                        }
                    }
                },
                {
                    // default message fields
        
                    // sender info
                    from: '上海青少年活动中心 <shqzx_activity@163.com>',
                    headers: {
                        'X-Laziness-level': 1000 // just an example header, no need to use this
                    }
                }
            );
        }
    }
});
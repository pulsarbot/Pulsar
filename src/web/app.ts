/*
    web
    The Pulsar Web app manager
    Copyright (C) 2020 The Pulsar Project
*/

// Import Modules for Web Service
import express, { NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cookies from 'cookies';
import { errorPage } from './handlers/web-client';

// Create Index Router for Main Events
import indexRouter from './routes/index';
import serverRouter from './routes/server';
import serversRouter from './routes/servers';
import commandRouter from './routes/commands';

// Start the Web App
const app = express();

// Setup the View Engine
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'ejs'); // Configures the system to use EJS

// Configure Express to use certain modules
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookies.express(['PulsarDiscord']));
app.use(express.static(path.join(__dirname, '../../public')));

// Use the Index router for files on the root directory.
app.use('/', indexRouter);
app.use('/server/', serverRouter);
app.use('/servers/', serversRouter);
app.use('/commands/', commandRouter);

// Catch any 404 errors and forward to error handler
app.use(function(req, res, next) {
	next(errorPage(res, 404, 'Resource Not Found', 'The requested resource was not found on the server.'));
  });
  
  // error handler
  app.use(function(err: ResponseError, req: express.Request, res: express.Response, next: NextFunction) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
	next();
});

export = app;

// Handle HTTP Errors
interface ResponseError {
	status?: number;
	message: string;
}
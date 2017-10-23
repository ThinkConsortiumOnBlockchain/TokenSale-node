'use strict';

var Refercode      = require('./RefercodeSchema');
var RefercodeModel = require('./RefercodeModel');
var User           = require(BASE_PATH + '/app/components/User/UserSchema');

module.exports = {

    /**
     * index() returns a result for resource (all and paginated)
     * based on passed query parameters
     *
     * @url {{URL}}/referralcode
     * @param <String> sortOrder, sortBy, code
     * @param <Integer> pageNumber, recordsPerPage
     * @return <Element> Array of referralCodes
     */

    index: function (req, res) {
        try {
            var search       = {};

            var sortBy       = helpers.getSortBy(req);
            var sortOrder    = helpers.getSortOrder(req);
            var sortData     = {}; //create an empty object
            var allowFields = ['code'];

            // assign that object  now
            sortData[sortBy] = sortOrder;

            var query = Refercode.find({}).select(RefercodeModel.getFields());

            query.sort(sortData);

            //search filteration
            if (typeof req.query.search !== 'undefined') {
                var search = JSON.parse(req.query.search);

                for (var key in search) {
                    if (allowFields.includes(key)) {
                        if (mongoose.Types.ObjectId.isValid(search[key]) || key === 'code') {
                            /*if (key === 'code')
                                query.where('code', search[key]);
                            else*/
                                query.where(key, search[key]);
                        } else {
                            query.where(key).regex(new RegExp('.*' + search[key] + ('.*'), 'i')).exists();
                        }
                    }
                }
            }

            //if records all then send all the records
            if (typeof req.query.records !== 'undefined' && req.query.records === 'all') {
                query.exec(function(err, referCodeData) {
                    if (err) {
                        log('Error in Refer Code => index API : ', err);
                        helpers.createResponse(res, constants.SERVER_ERROR,
                            messages.SERVER_ERROR_MESSAGE,
                            { 'error' : messages.SERVER_ERROR_MESSAGE }
                        );
                    } else {
                        log('Refer code list');
                        helpers.createResponse(res, constants.SUCCESS,
                            messages.MODULE_LIST_SUCCESS(constants.REFERCODE_MODEL_NAME),
                            {'data' : referCodeData}
                        );
                    }
                });
            } else {
                //pagination paramter
                var pageNumber      = parseInt(helpers.getPageNumber(req));
                var recordsPerPage  = parseInt(helpers.getRecordsPerPage(req));
                var skip            = (pageNumber - 1) * recordsPerPage;
                var totalRecords    = 0;

                query.exec(function(err, referCodeCountData) {
                    if (err) {
                        log('Error in Refer Code => index API : ', err.message);
                        helpers.createResponse(res, constants.SERVER_ERROR,
                            messages.SERVER_ERROR_MESSAGE,
                            { 'error' : messages.SERVER_ERROR_MESSAGE }
                        );
                    } else {
                        totalRecords = referCodeCountData.length;

                        query.limit(recordsPerPage);
                        query.skip(skip);

                        query.exec(function (err, referCodeData) {
                            if (err) {
                                log('Error in Refer Code => index API : ', err.message);
                                helpers.createResponse(res, constants.SERVER_ERROR,
                                    messages.SERVER_ERROR_MESSAGE,
                                    { 'error' : messages.SERVER_ERROR_MESSAGE }
                                );
                            } else {
                                var pager = {
                                    'sortBy'          : sortBy,
                                    'sortOrder'       : sortOrder,
                                    'pageNumber'      : pageNumber,
                                    'recordsPerPage'  : recordsPerPage,
                                    'filteredRecords' : parseInt(referCodeData.length),
                                    'totalRecords'    : totalRecords
                                };
                                helpers.createResponse(res, constants.SUCCESS,
                                    messages.MODULE_LIST_SUCCESS(constants.REFERCODE_MODEL_NAME),
                                    {'data' : referCodeData}, pager
                                );
                            }
                        });
                    }
                });
            }
        } catch (err) {
            log('Error in Refer Code => index API : ', err);
            helpers.createResponse(res, constants.SERVER_ERROR,
                messages.SERVER_ERROR_MESSAGE,
                {'error': messages.SERVER_ERROR_MESSAGE}
            );
        }
    }, // index function close

    /**
     * store() stores a new resource
     * based on passed query parameters
     *
     * @url {{URL}}/referrals
     * @param <String> email, ethereumAddress
     * @return <String> Success or Error message
     */

    store: function (req, res) {
        try {
            var loggedInUser = helpers.parseJWTToken(req);
            if (! loggedInUser) {
                log('Error in parsing JWT : ', err);
                helpers.createResponse(res, constants.SERVER_ERROR,
                    messages.SERVER_ERROR_MESSAGE,
                    {'error': messages.SERVER_ERROR_MESSAGE}
                );
            } else {
                helpers.findOne(res, Refercode, constants.REFERCODE_MODEL_NAME,
                    {email: req.body.email}, {},
                    function (refercodeInfo) {
                        if (refercodeInfo) {
                            log('Refercode already exists for this email');
                            helpers.createResponse(res, constants.UNPROCESSED,
                                messages.REFERCODE_EXISTS,
                                {'error': messages.REFERCODE_EXISTS}
                            );
                        } else {
                            var referCode = null;
                            var codeRepeatFlag = false;

                            async.whilst(function () {
                                return codeRepeatFlag === false;
                            }, function (next) {
                                var code = helpers.referCode(8);
                                helpers.findOne(res, Refercode, constants.REFERCODE_MODEL_NAME,
                                    {code: code}, {},
                                    function (codeInfo) {
                                        if (codeInfo) {
                                            codeRepeatFlag = false;
                                            next();
                                        } else {
                                            referCode = code;
                                            codeRepeatFlag = true;
                                            next();
                                        }
                                    }
                                );
                            }, function () {
                                var newReferCode = new Refercode({
                                    email           : req.body.email,
                                    ethereumAddress : req.body.ethereumAddress,
                                    code            : referCode,
                                    ipAddress       : req.connection.remoteAddress,
                                    userId          : loggedInUser._id
                                });

                                newReferCode.save(function (err, referCode) {
                                    if (err) {
                                        log('Error in Refercode store => save : ', err.message);
                                        helpers.createResponse(res, constants.SERVER_ERROR,
                                            messages.MODULE_STORE_ERROR(constants.REFERCODE_MODEL_NAME),
                                            {'error': messages.SERVER_ERROR_MESSAGE}
                                        );
                                    } else {
                                        helpers.findOneUpdateOrInsert(res, User, constants.USER_MODEL_NAME,
                                            {email: req.body.email},
                                            {$set: {referralCode: referCode.code}},
                                            {new: true, runValidators: true},
                                            function (updatedUser) {
                                                log('Base URL : ' + constants.BASE_DESIGN_URL);
                                                var link = constants.BASE_DESIGN_URL + '?' + 'ref=' + referCode.code;
                                                log('link : ' + link);
                                                helpers.sendHtmlMail(
                                                    {
                                                        firstName : loggedInUser.firstName,
                                                        lastName  : loggedInUser.lastName,
                                                        code      : referCode.code,
                                                        link      : link
                                                    },
                                                    req.body.email, 'Refer Code - ProofTokensale', BASE_PATH + '/views/emails/refercode.hbs'
                                                );
                                                log('Refercode added successfully !');
                                                helpers.createResponse(res, constants.SUCCESS,
                                                    messages.REFERCODE_SUCCESS,
                                                    {'data': referCode.code}
                                                );
                                            }
                                        );
                                    }
                                });
                            });
                        }
                    }
                );
            }
        } catch (err) {
            log('Error in refercode => store API : ', err);
            helpers.createResponse(res, constants.SERVER_ERROR,
                messages.SERVER_ERROR_MESSAGE,
                {'error': messages.SERVER_ERROR_MESSAGE}
            );
        }
    }, // store function close

    /*/!**
     * show() get details of particular resource
     * based on passed resource id
     *
     * @url {{URL}}/transaction/resourceId
     * @param <ObjectId> resourceId
     * @return <Element> Resource Details
     *!/

    show: function (req, res) {
        helpers.findOne(res, Transaction, constants.TRANSACTION_MODEL_NAME,
            {'_id': req.params.objectId}, {},
            function (transaction) {
                if (!transaction || typeof transaction === 'undefined') {
                    log("Refer does not exist for " + req.params.objectId + " in show method :");
                    helpers.createResponse(res, constants.UNPROCESSED,
                        messages.MODULE_NOT_FOUND(constants.TRANSACTION_MODEL_NAME),
                        {'error': messages.MODULE_NOT_FOUND(constants.TRANSACTION_MODEL_NAME)});
                } else {
                    log('Transaction show API Success!');
                    helpers.createResponse(res, constants.SUCCESS,
                        messages.MODULE_SHOW_SUCCESS(constants.TRANSACTION_MODEL_NAME),
                        { 'data' : transaction }
                    );
                }
            }
        );
    }, //show function close*/
};
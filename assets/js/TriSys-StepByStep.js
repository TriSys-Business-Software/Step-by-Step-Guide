/* TriSys Web API 
 *
 * Step by Step Guide to buiding recruitment agency web sites.
 *
 * (c) 2010-2015 TriSys Business Software
 *
 * API documentation: https://api.trisys.co.uk
 *
 * Step by Step Guide: http://jobs.trisys.co.uk
 *
 * This code is public domain open source and is available on github at:
 * https://github.com/TriSysBusinessSoftware/Step-by-Step-Guide
 *
*/
var TriSysStepByStep =
{
    Step2:
    {
        Load: function()
        {
            TriSysStepByStep.Step2.VacancySearch();
            TriSysStepByStep.Step2.LoadSearchCriteria();
        },

        // Search for live vacancies to display quickly on the page
        VacancySearch: function()
        {
            $('#trisys-api-results').html('Calling the TriSys Web API...');

            var sJobTitle = $('#trisys-vacancy-search-jobtitles option:selected').text();
            var sLocation = $('#trisys-vacancy-search-locations option:selected').text();

            var CVacancySearchCriteria =
                {
                    PageNumber: 1,
                    RecordsPerPage: 25,

                    //Reference: '%381%',
                    //Status: 'Active',
                    Location: sLocation,
                    JobTitle: sJobTitle,

                    Permanent: true,
                    Contract: true,
                    Temp: true,

                    //StartDate: '24 Aug 2015',
                    //StartDateOnOrAfter: true,

                    //SalaryRateMinimum: '£27,000 per Annum',
                    //SalaryRateMaximum: '£29,000 per Annum',

                    SortColumnName: 'StartDate',
                    SortAscending: true
                };

            // The callback function which displays live jobs once connected
            var fnAuthenticated = function (bAuthenticated)
            {
                var payloadObject = {};

                payloadObject.URL = 'Vacancies/Search';
                payloadObject.OutboundDataPacket = CVacancySearchCriteria;
                payloadObject.InboundDataFunction = function (CVacancySearchResponse)
                {
                    // Raw
                    var sDisplay = JSON.stringify(CVacancySearchResponse);
                    $('#trisys-api-results').html(sDisplay);

                    // Themed table
                    $('#trisys-api-results').html("Authenticated.");

                    // Show a structured rendering of the vacancy
                    TriSysStepByStep.Step2.PopulateVacanciesGrid(CVacancySearchResponse.Vacancies);

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('http://jobs.trisys.co.uk/step-2/ : ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            };
            

            // Connect to TriSys for Websites for vacancies only
            var tfw = TriSysAPI.TriSysForWebsites;
            var tfwdc = tfw.DemonstrationCredentials;
            tfwdc.AgencyUserLoginCredentialsToCRM = tfwdc.AgencyVacancyDataServicesKey;

            TriSysAPI.TriSysForWebsites.Authenticate(fnAuthenticated, false, false);
        },

        // Show both vacancy search results, favourites and vacancy applications
        PopulateVacanciesGrid: function (vacancies)
        {
            if (!vacancies || vacancies.length == 0)
                return;

            var vacancyData = [];
            for (var i = 0; i < vacancies.length; i++)
            {
                var vacancy = vacancies[i];

                var vacancyObject = {
                    RequirementId: vacancy.RequirementId,
                    Reference: vacancy.Reference,
                    JobTitle: vacancy.JobTitle,
                    Location: vacancy.Location,
                    SalaryRate: vacancy.SalaryRate,
                    StartDate: vacancy.StartDate,
                    Permanent: vacancy.Permanent,
                    Contract: vacancy.Contract,
                    Temporary: vacancy.Temp,
                    DateFavourited: vacancy.DateFavourited,
                    DateShortlisted: vacancy.DateShortlisted
                };

                vacancyData.push(vacancyObject);
            }

            var directives =
            {
                hyperlink:
                {
                    href: function (params)
                    {
                        return "http://jobs.trisys.co.uk/step-3/?RequirementId=" + this.RequirementId;
                    }
                },
                Type:
                {
                    text: function (params)
                    {
                        var sType = 'Temp';
                        if (this.Permanent)
                            sType = 'Perm';
                        else if (this.Contract)
                            sType = 'Contract';

                        return sType;
                    },

                    class: function (params)
                    {
                        var sLabel = "label label-";
                        if (this.Permanent)
                            sLabel += "info";
                        else if (this.Contract)
                            sLabel += "danger";
                        else if (this.Temporary)
                            sLabel += "warning";

                        return sLabel;
                    }
                }
            };

            $('.vacancies').render(vacancyData, directives);
        },

        // Gather lookups for live jobs so that user many refine their job search
        LoadSearchCriteria: function()
        {
            // The callback function which displays live job lookups
            var fnAuthenticated = function (bAuthenticated)
            {
                var CVacancySearchLookupsRequest = { LiveOnly: true };

                var payloadObject = {};

                payloadObject.URL = 'Vacancies/Lookups';
                payloadObject.OutboundDataPacket = CVacancySearchLookupsRequest;
                payloadObject.InboundDataFunction = function (CVacancySearchLookupsResponse)
                {
                    // Populate the location and job title combos

                    for (var i = 0; i < CVacancySearchLookupsResponse.JobTitles.length; i++) 
                    {
                        var sJobTitle = CVacancySearchLookupsResponse.JobTitles[i];
                        $('#trisys-vacancy-search-jobtitles').append($('<option>', { value: sJobTitle}).text(sJobTitle));
                    }

                    for (var i = 0; i < CVacancySearchLookupsResponse.Locations.length; i++) 
                    {
                        var sLocation = CVacancySearchLookupsResponse.Locations[i];
                        $('#trisys-vacancy-search-locations').append($('<option>', { value: sLocation }).text(sLocation));
                    }

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('http://jobs.trisys.co.uk/step-2/ : ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            };


            var tfw = TriSysAPI.TriSysForWebsites;
            var tfwdc = tfw.DemonstrationCredentials;
            tfwdc.AgencyUserLoginCredentialsToCRM = tfwdc.AgencyVacancyDataServicesKey;

            TriSysAPI.TriSysForWebsites.Authenticate(fnAuthenticated, false, false);
        }
    },

    Step3:
    {
        Load: function ()
        {
            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            if (lRequirementId)
                TriSysStepByStep.Step3.ShowVacancySummary(lRequirementId);
            else
            {
                alert("Please select a vacancy from the search in step 2, or your list of favourites in step 10.");
                window.location.replace("http://jobs.trisys.co.uk/step-2/");
            }
        },

        ShowVacancySummary: function (lRequirementId, showHideButtons)
        {
            if (TriSysStepByStep.Cookies.isLoggedIn())
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

            $('#trisys-api-results').html('Authenticating...');

            var CVacancySummaryRequest =
                {
                    RequirementId: lRequirementId
                };

            var fnAuthenticated = function (bAuthenticated)
            {
                $('#trisys-api-results').html('Authenticated.');

                var payloadObject = {};

                payloadObject.URL = 'Vacancy/Summary';
                payloadObject.OutboundDataPacket = CVacancySummaryRequest;
                payloadObject.InboundDataFunction = function (CVacancySummaryResponse)
                {
                    var sDisplay = JSON.stringify(CVacancySummaryResponse);

                    $('#trisys-api-results').html(sDisplay);

                    var sSummary = CVacancySummaryResponse.Reference + " &bull; " + CVacancySummaryResponse.JobTitle + " &bull; " + CVacancySummaryResponse.Location;
                    $("#trisys-vacancy-summary").html(sSummary);

                    var sDescription = CVacancySummaryResponse.JobDescription;

                    var sPayType = "Rate";
                    if (CVacancySummaryResponse.Type == "Permanent")
                        sPayType = "Salary";

                    sDescription += "<hr>" +
                        "<h4>" + sPayType + "</h4>" +
                        "<p>Up to " + CVacancySummaryResponse.MaximumSalaryRate + "</p>";

                    sDescription += "<hr>" +
                        "<h4>Start Date</h4>" +
                        "<p>" + CVacancySummaryResponse.StartDate + "</p>";

                    $("#trisys-vacancy-jobdescription").html(sDescription);

                    $("#trisys-vacancy-username").html(CVacancySummaryResponse.UserName);
                    fnGetUser(CVacancySummaryResponse.UserId, CVacancySummaryResponse.Reference, CVacancySummaryResponse.JobTitle);

                    if (showHideButtons)
                    {
                        if (CVacancySummaryResponse.Shortlisted)
                        {
                            $('#' + showHideButtons.apply).hide();
                            $('#' + showHideButtons.remove).show();
                        }
                    }

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('http://jobs.trisys.co.uk/step-3 : ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            };

            var fnGetUser = function (lUserId, sReference, sJobTitle)
            {
                var CReadUserAccountRequest = { UserId: lUserId };

                var payloadObject = {};

                payloadObject.URL = 'Users/ReadUserAccount';
                payloadObject.OutboundDataPacket = CReadUserAccountRequest;
                payloadObject.InboundDataFunction = function (CReadUserAccountResponse)
                {
                    var user = CReadUserAccountResponse.UserAccount;
                    var contact = user.Contact;

                    $("#trisys-vacancy-user-name").html(contact.FullName);
                    $("#trisys-vacancy-user-company").html(contact.CompanyName);
                    $("#trisys-vacancy-user-jobtitle").html(contact.JobTitle);
                    $("#trisys-vacancy-user-worktelno").html(contact.WorkTelNo);
                    $("#trisys-vacancy-user-mobiletelno").html(contact.WorkMobileTelNo);

                    if (user.Photo)
                        $("#trisys-vacancy-userphoto").attr('src', user.Photo).show();

                    $("#trisys-vacancy-user-email").attr('href', "mailto:" + contact.WorkEMail + "?subject=" + sReference + ": " + sJobTitle);
                    $("#trisys-vacancy-user-email").html(contact.WorkEMail);

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('http://jobs.trisys.co.uk/step-3 : ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            };

            if (TriSysStepByStep.Cookies.isLoggedIn())
                fnAuthenticated(true);
            else
            {
                // Connect to TriSys for Websites for vacancies only
                var tfw = TriSysAPI.TriSysForWebsites;
                var tfwdc = tfw.DemonstrationCredentials;
                tfwdc.AgencyUserLoginCredentialsToCRM = tfwdc.AgencyVacancyDataServicesKey;

                tfw.Authenticate(fnAuthenticated, false, false);
            }
        },

        Apply: function()
        {
            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");
            window.location.replace("http://jobs.trisys.co.uk/step-11/?RequirementId=" + lRequirementId);
        },

        AddToFavourites: function()
        {
            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            var CVacancyAddFavouriteRequest = {
                RequirementId: lRequirementId
            };

            var payloadObject = {};

            payloadObject.URL = 'Vacancy/AddFavourite';
            payloadObject.OutboundDataPacket = CVacancyAddFavouriteRequest;
            payloadObject.InboundDataFunction = function (CVacancyAddFavouriteResponse)
            {
                window.location.replace("http://jobs.trisys.co.uk/step-10");

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step3.AddToFavourites: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        },

        RemoveFromFavourites: function()
        {
            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            var CVacancyDeleteFavouriteRequest = {
                RequirementId: lRequirementId
            };

            var payloadObject = {};

            payloadObject.URL = 'Vacancy/DeleteFavourite';
            payloadObject.OutboundDataPacket = CVacancyDeleteFavouriteRequest;
            payloadObject.InboundDataFunction = function (CVacancyDeleteFavouriteResponse)
            {
                window.location.replace("http://jobs.trisys.co.uk/step-10");

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step3.RemoveFromFavourites: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step4:
    {
        Load: function()
        {
            // Only if not logged in will we allow password request
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                alert("You are already logged in and contact us is normally for enquiries.");
                window.location.replace("http://jobs.trisys.co.uk/step-8/");
                return;
            }

            var fnPopulateTitleCombo = function (bAuthenticated)
            {
                // Load all of the contact titles and any other lookups
                TriSysStepByStep.ContactTitles.LoadCombo("cmbContactTitle");
            }

            // Connect to TriSys for Websites for vacancies only
            var tfw = TriSysAPI.TriSysForWebsites;
            var tfwdc = tfw.DemonstrationCredentials;
            tfwdc.AgencyUserLoginCredentialsToCRM = tfwdc.AgencyVacancyDataServicesKey;

            TriSysAPI.TriSysForWebsites.Authenticate(fnPopulateTitleCombo, false, false);
        },

        ContactUsSubmission: function()
        {
            // Gather form fields
            var sTitle = $('#cmbContactTitle option:selected').text();
            var sForenames = $('#txtForenames').val();
            var sSurname = $('#txtSurname').val();
            var sCompany = $('#Contact_CompanyName').val();
            var sHomeTelNo = $('#Contact_HomeAddressTelNo').val();
            var sWorkTelNo = $('#Contact_WorkTelNo').val();
            var sPersonalMobile = $('#Contact_MobileTelNo').val();
            var sWorkMobile = $('#ContactConfigFields_WorkMobile').val();
            var sWorkEMail = $('#Contact_EMail').val();
            var sPersonalEMail = $('#ContactConfigFields_AlternativeEMailAddress1').val();
            var sTypeOfEnquiry = $('#typeOfEnquiry option:selected').text();
            var sMessage = $('#txtMessage').val();

            // Validate mandatory data
            var sError = '';
            if (!sForenames || !sSurname)
                sError = "Please supply your name.";
            else
            {
                if (!sHomeTelNo && !sWorkTelNo && !sPersonalMobile && !sWorkMobile)
                    sError = "Please supply a phone number.";
                else
                {
                    if (!TriSysApex.LoginCredentials.validateEmail(sWorkEMail) && !TriSysApex.LoginCredentials.validateEmail(sPersonalEMail))
                        sError = "Please supply an e-mail address.";
                    else
                        if (sTypeOfEnquiry.length <= 1)
                            sError = "Please specify the type of enquiry.";
                        else
                            if (sMessage.length <= 1)
                                sError = "Please enter your message to us.";
                }
            }

            if (sError.length > 1)
            {
                alert(sError);
                return;
            }

            // Bundle up into a JSON object for transfer across the wire
            var CEnquiryContactUsRequest = {
                Title: sTitle,
                Forenames: sForenames,
                Surname: sSurname,
                Company: sCompany,
                HomeTelNo: sHomeTelNo,
                WorkTelNo: sWorkTelNo,
                PersonalMobile: sPersonalMobile,
                WorkMobile: sWorkMobile,
                WorkEMail: sWorkEMail,
                PersonalEMail: sPersonalEMail,
                TypeOfEnquiry: sTypeOfEnquiry,
                Message: sMessage
            };

            // Send this data packet to the API for processing
            TriSysStepByStep.Step4.SendToAPI(CEnquiryContactUsRequest);
        },

        SendToAPI: function (CEnquiryContactUsRequest)
        {
            var payloadObject = {};
            payloadObject.URL = "Enquiry/ContactUs";
            payloadObject.OutboundDataPacket = CEnquiryContactUsRequest;
            payloadObject.InboundDataFunction = function (data)
            {
                var CEnquiryContactUsResponse = data;
                if (CEnquiryContactUsResponse)
                {
                    if (CEnquiryContactUsResponse.Success)
                        alert("Contact us succeeded.");
                    else
                        alert("Contact us failed.");
                }

                return true;
            };
            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('SendToAPI: ', request, status, error);
            };
            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step5:
    {
        Load: function ()
        {
            // Only if not logged in will we allow registration
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                alert("You are already logged in so cannot register.");
                window.location.replace("http://jobs.trisys.co.uk/step-8/");
                return;
            }

            var fnPopulateTitleCombo = function (bAuthenticated)
            {
                var sURL = window.location.href;
                var sGUID = TriSysApex.URL.Parser(sURL).getParam("GUID");
                if (sGUID)
                {
                    // Candidate has clicked the e-mail to confirm their registration.
                    var sSite = TriSysApex.URL.Parser(sURL).getHost();
                    TriSysStepByStep.Step5.ConfirmedGUIDSubmissionToWebAPI(sGUID, sSite);
                }
                else
                {
                    // Load all of the contact titles and any other lookups
                    TriSysStepByStep.ContactTitles.LoadCombo("cmbContactTitle");
                }
            }

            // Connect to TriSys for Websites for vacancies only
            var tfw = TriSysAPI.TriSysForWebsites;
            var tfwdc = tfw.DemonstrationCredentials;
            tfwdc.AgencyUserLoginCredentialsToCRM = tfwdc.AgencyVacancyDataServicesKey;

            TriSysAPI.TriSysForWebsites.Authenticate(fnPopulateTitleCombo, false, false);
        },

        PostCodelookup: function()
        {
            TriSysSDK.PostCode.Lookup("txtPostCode", "txtStreet", "txtTownCity", "txtCounty", "Contact_HomeAddressCountry");
        },

        RegistrationSubmission: function ()
        {
            var sForenames = $('#txtForename').val();
            var sSurname = $('#txtSurname').val();
            var sPassword = $('#pwPassword').val();
            var sVerifyPassword = $('#pwConfirm').val();
            var sEMail = $('#txtEmail').val();
            var sTitle = $('#cmbContactTitle option:selected').text();
            var sJobTitle = $('#txtJobTitle').val();
            var sStreet = $('#txtStreet').val();
            var sCity = $('#txtTownCity').val();
            var sCounty = $('#txtCounty').val();
            var sPostCode = $('#txtPostCode').val();
            var sCountry = $('#txtCountry').val();
            var sHomeTelNo = $('#txtHomeTel').val();
            var sMobileTelNo = $('#txtMobTel').val();
            var CVfile = document.getElementById('fileCV').files[0];
            //var bAgree = TriSysApex.UI.CheckBoxFieldValueToBoolean('chkSignUp_Agree');

            // Validation rules
            var sRuleFailure = '';
            if (!sForenames) sRuleFailure += 'Please enter your forename(s)' + '\n';
            if (!sSurname) sRuleFailure += 'Please enter your surname' + '\n';
            if (!sPassword)
                sRuleFailure += 'Please enter a password' + '\n';
            else
            {
                var iMinLength = TriSysApex.Constants.iMinimumPasswordLength;
                if (sPassword.length < iMinLength)
                    sRuleFailure += 'Please enter a password with a mininum length of ' + iMinLength + ' characters' + '\n';
            }
            if (sPassword != sVerifyPassword) sRuleFailure += 'Please confirm your password' + '\n';

            if (!TriSysApex.LoginCredentials.validateEmail(sEMail)) sRuleFailure += "Please enter a valid e-mail address." + '\n';

            if (!CVfile) sRuleFailure += "Please select a copy of your CV." + '\n';

            if (sRuleFailure.length > 0)
            {
                alert(sRuleFailure);
                return;
            }

            // Validation rules are now passed, so submit to the server
            var sURL = window.location.href;

            var CNewCandidateSignUpRequest = {
                Forenames: sForenames,
                Surname: sSurname,
                Password: sPassword,
                EMail: sEMail,
                Title: sTitle,
                JobTitle: sJobTitle,
                Street: sStreet,
                City: sCity,
                County: sCounty,
                PostCode: sPostCode,
                Country: sCountry,
                HomeTelNo: sHomeTelNo,
                MobileTelNo: sMobileTelNo,
                CVFileRef: CVfile,
                URL: sURL
            };

            // We have a CV file so must use the HTTP File handling to send this
            // up to the Web API which will store in a holding area server side.
            // We can then pass the temp file reference in with the candidate
            // update request and it will move it to the appropriate place.
            var files = [];
            files.push(CNewCandidateSignUpRequest.CVFileRef);

            TriSysAPI.TriSysForWebsites.UploadFiles(files, function (uploadedFiles)
            {
                // We may have uploaded 2 files hence we must now identify which one
                // is the photo and which one is the CV
                for (var i = 0; i < uploadedFiles.length; i++)
                {
                    var sFilePath = uploadedFiles[i];
                    CNewCandidateSignUpRequest.CVFileRef = sFilePath;
                }

                // Now update the candidate
                TriSysStepByStep.Step5.SubmitRegistrationToWebAPI(CNewCandidateSignUpRequest);
            });
        },

        SubmitRegistrationToWebAPI: function (CNewCandidateSignUpRequest)
        {
            var payloadObject = {};

            payloadObject.URL = 'Security/RegisterCandidate';
            payloadObject.OutboundDataPacket = CNewCandidateSignUpRequest;
            payloadObject.InboundDataFunction = function (CNewCandidateSignUpResponse)
            {
                var sDisplay = JSON.stringify(CNewCandidateSignUpResponse);

                if (CNewCandidateSignUpResponse.Success)
                    alert("Candidate registration succeeded.");
                else
                    alert("Candidate registration failed.");

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step5.SubmitRegistrationToWebAPI ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        },

        ConfirmedGUIDSubmissionToWebAPI: function (sGUID, sSite)
        {
            var sContactComments = "Registered at " + sSite + " on " + moment().format('dddd DD MMMM YYYY');

            var CConfirmCandidateSignUpRequest = {
                EMailGUIDKey: sGUID,
                Comments: sContactComments,
                SiteURL: sSite
            };

            var payloadObject = {};
            payloadObject.URL = "Security/RegisterCandidateConfirmation";
            payloadObject.OutboundDataPacket = CConfirmCandidateSignUpRequest;
            payloadObject.InboundDataFunction = function (CConfirmCandidateSignUpResponse)
            {
                if (CConfirmCandidateSignUpResponse)
                {
                    if (CConfirmCandidateSignUpResponse.Success)
                        alert("Thank you for confirming your registration." + "\n" + "You may now login.");
                    else
                        alert(CConfirmCandidateSignUpResponse.ErrorMessage);
                }
                else
                    alert("No response from " + payloadObject.URL);

                return true;
            };
            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step5.ConfirmedGUIDSubmissionToWebAPI: ', request, status, error);
            };
            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step6:
    {
        Load: function ()
        {
            // Only if not logged in will we allow login
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                alert("You are already logged in.");
                window.location.replace("http://jobs.trisys.co.uk/step-8/");
                return;
            }
        },

        LoginSubmission: function ()
        {
            var sLoginEMail = $('#txtEmail').val();
            var sPassword = $('#pwPassword').val();

            if (!TriSysApex.LoginCredentials.validateEmail(sLoginEMail))
            {
                alert("Please enter a valid e-mail address.");
                return;
            }

            if (!sPassword)
            {
                alert("Please enter a valid password.");
                return;
            }

            // We must connect using the TriSys CRM agency user credentials in order to access the correct cloud database,
            // and also pass in the client/candidate contact details which live in the agency SQL database
            var dataPacket = {
                'CRMCredentialKey': TriSysAPI.TriSysForWebsites.DemonstrationCredentials.AgencyUserLoginCredentialsToCRM,
                'AccountType': TriSysAPI.TriSysForWebsites.TriSysCRMCredentialAccountTypeEnum.AgencyClientOrCandidate,
                'AgencyContact_EMail': sLoginEMail,
                'AgencyContact_Password': sPassword
            };

            var fnPostLogin = function (sDataServicesKey)
            {
                // Record in session state to be used in each transaction
                TriSysStepByStep.Cookies.AfterLogin(sDataServicesKey);

                alert("You are now logged in and have a new session key: " + sDataServicesKey);

                // Redirect to the logoff page to show their credentials
                window.location.replace("http://jobs.trisys.co.uk/step-8/");
            };

            var fnIncorrectLogin = function ()
            {
                alert("Login failed.");
            };

            TriSysStepByStep.Step6.SubmitToWebAPI(dataPacket, fnPostLogin, fnIncorrectLogin);
        },

        SubmitToWebAPI: function (CSecurityControllerAuthenticateTriSysCRMCredentials, fnPostLogin, fnIncorrectLogin)
        {
            var payloadObject = {};

            payloadObject.URL = 'Security/AuthenticateTriSysCRMCredentials';

            // Our payload
            payloadObject.OutboundDataPacket = CSecurityControllerAuthenticateTriSysCRMCredentials;

            // Callback function
            payloadObject.InboundDataFunction = function (data)
            {
                var sDataServicesKey = data;

                if (sDataServicesKey)
                    fnPostLogin(sDataServicesKey);
                else
                    fnIncorrectLogin();

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step6.SubmitToWebAPI: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step7:
    {
        Load: function ()
        {
            // Only if not logged in will we allow password request
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                alert("You are already logged in so should use profile editor to change password.");
                window.location.replace("http://jobs.trisys.co.uk/step-9/");
                return;
            }
        },

        ForgottenPasswordSubmission: function ()
        {
            var sEMail = $('#txtEmailAddress').val();
            if (!TriSysApex.LoginCredentials.validateEmail(sEMail))
            {
                alert("Invalid e-mail address.");
                return;
            }

            var sURL = window.location.href;
            var sSite = TriSysApex.URL.Parser(sURL).getHost();

            // Send this e-mail address now to the API so that it can take appropriate action
            var CAgencyForgottenPasswordRequest = {
                EMail: sEMail,
                SiteURL: sSite
            };

            var fnOnSuccessfulRequest = function ()
            {
                alert("Thank you for requesting your password. Please check your e-mail.")
            };

            var fnOnFailedRequest = function ()
            {
                alert("Unable to verify your e-mail address.");
            };

            TriSysStepByStep.Step7.SubmitToWebAPI(CAgencyForgottenPasswordRequest, fnOnSuccessfulRequest, fnOnFailedRequest);
        },

        SubmitToWebAPI: function (CAgencyForgottenPasswordRequest, fnSuccess, fnFailure)
        {
            var payloadObject = {};
            payloadObject.URL = "Security/ForgottenAgencyClientOrCandidatePasswordRequest";
            payloadObject.OutboundDataPacket = CAgencyForgottenPasswordRequest;
            payloadObject.InboundDataFunction = function (CAgencyForgottenPasswordResponse)
            {
                if (CAgencyForgottenPasswordResponse)
                {
                    if (CAgencyForgottenPasswordResponse.Success)
                        fnSuccess();
                    else
                        fnFailure();
                }

                return true;
            };
            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                TriSysApex.UI.ErrorHandlerRedirector('TriSysStepByStep.Step7.SubmitToWebAPI: ', request, status, error);
            };
            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step8:
    {
        Load: function ()
        {
            TriSysStepByStep.Redirect.ifNotLoggedIn("logoff");

            // Only if logged in will we show data
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                // Use our candidate session key
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

                // Read the current login details
                TriSysStepByStep.Step9.LoadLoggedInCandidateProfile(function (contact)
                {
                    var sMessage = "Logged in as a candidate: " + "<br />" +
                        "Name: <b>" + contact.Forenames + " " + contact.Surname + "</b><br />" +
                        "E-Mail: <b>" + contact.PersonalEMail + "</b><br />" +
                        "Job Title: <b>" + contact.JobTitle + "</b><br />" +
                        "Home Phone: <b>" + contact.HomeAddressTelNo + "</b><br />" +
                        "Mobile Phone: <b>" + contact.MobileTelNo + "</b>";

                    $('#trisys-logoff-status').html(sMessage);
                });
            }
        },

        LogoffSubmission: function ()
        {
            var payloadObject = {};

            payloadObject.URL = 'Security/Logoff';
            payloadObject.OutboundDataPacket = null;
            payloadObject.InboundDataFunction = function (data)
            {
                TriSysStepByStep.Cookies.AfterLogin(null);
                alert("You have been logged off.");
                window.location.replace("http://jobs.trisys.co.uk/step-6/");
                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step9.UpdateProfileSubmission: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step9:
    {
        Load: function ()
        {
            TriSysStepByStep.Redirect.ifNotLoggedIn("edit candidate profile");

            // Only if logged in will we show data
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                // Use our candidate session key
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

                // Populate lookups
                TriSysStepByStep.ContactTitles.LoadCombo("cmbContactTitle", function ()
                {
                    // Load our profile
                    TriSysStepByStep.Step9.LoadLoggedInCandidateProfile(function (contact)
                    {
                        $('#cmbContactTitle').val(contact.Title);
                        $('#txtForename').val(contact.Forenames);
                        $('#txtSurname').val(contact.Surname);
                        $('#txtEmail').val(contact.PersonalEMail);
                        $('#txtJobTitle').val(contact.JobTitle);
                        $('#txtStreet').val(contact.HomeAddressStreet);
                        $('#txtTownCity').val(contact.HomeAddressCity);
                        $('#txtCounty').val(contact.HomeAddressCounty);
                        $('#txtPostCode').val(contact.HomeAddressPostCode);
                        $('#txtCountry').val(contact.HomeAddressCountry);
                        $('#txtHomeTel').val(contact.HomeAddressTelNo);
                        $('#txtMobTel').val(contact.MobileTelNo);
                    });
                });
            }
        },

        LoadLoggedInCandidateProfile: function(fnCallback)
        {
            var payloadObject = {};

            payloadObject.URL = 'Security/PostLoginCRMCredentials';
            payloadObject.OutboundDataPacket = null;
            payloadObject.InboundDataFunction = function (CDataConnectionKey)
            {
                if (CDataConnectionKey)
                {
                    var contact = CDataConnectionKey.LoggedInAgencyContact;

                    if (fnCallback)
                        fnCallback(contact);                   
                }
                else
                    alert("Unable to read candidate profile.");

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step9.LoadLoggedInCandidateProfile: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        },

        UpdateProfileSubmission: function ()
        {
            var sForenames = $('#txtForename').val();
            var sSurname = $('#txtSurname').val();
            var sPassword = $('#pwPassword').val();
            var sVerifyPassword = $('#pwConfirm').val();
            var sEMail = $('#txtEmail').val();
            var sTitle = $('#cmbContactTitle option:selected').text();
            var sJobTitle = $('#txtJobTitle').val();
            var sStreet = $('#txtStreet').val();
            var sCity = $('#txtTownCity').val();
            var sCounty = $('#txtCounty').val();
            var sPostCode = $('#txtPostCode').val();
            var sCountry = $('#txtCountry').val();
            var sHomeTelNo = $('#txtHomeTel').val();
            var sMobileTelNo = $('#txtMobTel').val();
            var CVfile = document.getElementById('fileCV').files[0];

            // Validation rules
            var sRuleFailure = '';
            if (!sForenames) sRuleFailure += 'Please enter your forename(s)' + '\n';
            if (!sSurname) sRuleFailure += 'Please enter your surname' + '\n';
            if (sPassword != sVerifyPassword) sRuleFailure += 'Please confirm your new password' + '\n';

            if (!TriSysApex.LoginCredentials.validateEmail(sEMail)) sRuleFailure += "Please enter a valid e-mail address." + '\n';

            if (sRuleFailure.length > 0)
            {
                alert(sRuleFailure);
                return;
            }

            var CWriteLoggedInCandidateRequest = {
                Title: sTitle,
                Forenames: sForenames,
                Surname: sSurname,
                JobTitle: sJobTitle,
                PersonalEMail: sEMail,
                MobileTelNo: sMobileTelNo,
                Street: sStreet,
                City: sCity,
                County: sCounty,
                PostCode: sPostCode,
                Country: sCountry,
                HomeTelNo: sHomeTelNo,
                CVFileRef: CVfile,
                Password: sPassword
            };

            TriSysStepByStep.Step9.SubmitToWebAPI(CWriteLoggedInCandidateRequest);
        },

        SubmitToWebAPI: function (CWriteLoggedInCandidateRequest)
        {
            // After files uploaded, sent it and other data to the Web API candidate record
            var fnUpdateCandidate = function ()
            {
                var payloadObject = {};

                payloadObject.URL = 'Contact/WriteLoggedInCandidate';
                payloadObject.OutboundDataPacket = CWriteLoggedInCandidateRequest;
                payloadObject.InboundDataFunction = function (CWriteLoggedInCandidateResponse)
                {
                    var sDisplay = JSON.stringify(CWriteLoggedInCandidateResponse);

                    if (CWriteLoggedInCandidateResponse.Success)
                        alert("Candidate profile updated.");
                    else
                        alert("Error updating profile.");

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('TriSysStepByStep.Step9.SubmitToWebAPI: ' + status + ": " +
                          error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            };

            if (!CWriteLoggedInCandidateRequest.CVFileRef)
                fnUpdateCandidate();
            else
            {
                // Have to upload new CV, then update candidate profile
                var files = [];
                files.push(CWriteLoggedInCandidateRequest.CVFileRef);

                TriSysAPI.TriSysForWebsites.UploadFiles(files, function (uploadedFiles)
                {
                    for (var i = 0; i < uploadedFiles.length; i++)
                    {
                        var sFilePath = uploadedFiles[i];
                        CWriteLoggedInCandidateRequest.CVFileRef = sFilePath;
                    }

                    // Now update the candidate
                    fnUpdateCandidate();
                });
            }
        }
    },

    Step10:
    {
        Load: function()
        {
            TriSysStepByStep.Redirect.ifNotLoggedIn("manage favourite vacancies");
            TriSysStepByStep.Step10.GetFavouriteVacanciesFromWebAPI();
        },

        GetFavouriteVacanciesFromWebAPI: function()
        {
            // Only if logged in will we show data
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                // Use our candidate session key
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

                var CVacancyCandidateFavouritesRequest = {
                    PageNumber: 1,
                    RecordsPerPage: 25,
                    SortColumnName: "DateFavourited",
                    SortAscending: false
                };

                var payloadObject = {};

                payloadObject.URL = 'Vacancy/Favourites';
                payloadObject.OutboundDataPacket = CVacancyCandidateFavouritesRequest;
                payloadObject.InboundDataFunction = function (CVacancyCandidateFavouritesResponse)
                {
                    // Show a structured rendering of the vacancy
                    TriSysStepByStep.Step2.PopulateVacanciesGrid(CVacancyCandidateFavouritesResponse.Vacancies);

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('TriSysStepByStep.Step10.GetFavouriteVacanciesFromWebAPI: ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            }
        }
    },

    Step11:
    {
        Load: function ()
        {
            TriSysStepByStep.Redirect.ifNotLoggedIn("apply to vacancies");

            if (TriSysStepByStep.Cookies.isLoggedIn())
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            if (lRequirementId)
            {
                var showHideButtons = { apply: 'trisys-vacancy-apply', remove: 'trisys-vacancy-removeapplication' };
                TriSysStepByStep.Step3.ShowVacancySummary(lRequirementId, showHideButtons);
            }
            else
            {
                alert("Please select a vacancy from the search in step 2, or your list of favourites in step 10.");
                window.location.replace("http://jobs.trisys.co.uk/step-2/");
            }
        },

        Apply: function ()
        {
            // Use our candidate session key
            TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            var CVacancyApply = {
                URL: 'http://jobs.trisys.co.uk/step-3/?RequirementId=',
                Shortlist: true,
                RequirementId: lRequirementId
            };

            var payloadObject = {};

            payloadObject.URL = 'Vacancy/Apply';
            payloadObject.OutboundDataPacket = CVacancyApply;
            payloadObject.InboundDataFunction = function (data)
            {
                if (data && data.Success)
                {
                    alert("You have applied to this vacancy and will receive a confirmation e-mail shortly.");
                    window.location.replace("http://jobs.trisys.co.uk/step-12");
                }
                else
                {
                    alert("You have already applied to this vacancy.");
                }

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step11.Apply: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        },

        WithdrawApplication: function()
        {
            var sURL = window.location.href;
            var lRequirementId = TriSysApex.URL.Parser(sURL).getParam("RequirementId");

            var CVacancyWithdrawApplicationRequest = {
                URL: 'http://jobs.trisys.co.uk/step-3/?RequirementId=',
                RequirementIdList: [lRequirementId],
                Reason: 'TriSys Web API step by step guide sample code.'
            };

            var payloadObject = {};

            payloadObject.URL = 'Vacancy/WithdrawApplication';
            payloadObject.OutboundDataPacket = CVacancyWithdrawApplicationRequest;
            payloadObject.InboundDataFunction = function (data)
            {
                if (data && data.Success)
                {
                    alert("You have withdrawn your application to this vacancy and will receive a confirmation e-mail shortly.");
                    window.location.replace("http://jobs.trisys.co.uk/step-12");
                }
                else
                {
                    alert("Error withdrawing application.");
                }

                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.Step11.WithdrawApplication: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    Step12:
    {
        Load: function ()
        {
            TriSysStepByStep.Redirect.ifNotLoggedIn("manage vacancy applications");
            TriSysStepByStep.Step12.GetVacancyApplicationsFromWebAPI();
        },

        GetVacancyApplicationsFromWebAPI: function ()
        {
            // Only if logged in will we show data
            if (TriSysStepByStep.Cookies.isLoggedIn())
            {
                // Use our candidate session key
                TriSysAPI.Session.SetDataServicesKey(TriSysStepByStep.Cookies.DataServicesKey());

                var CVacancyCandidateApplicationsRequest = {
                    PageNumber: 1,
                    RecordsPerPage: 25,
                    SortColumnName: "DateShortlisted",
                    SortAscending: false
                };

                var payloadObject = {};

                payloadObject.URL = 'Vacancy/Applications';
                payloadObject.OutboundDataPacket = CVacancyCandidateApplicationsRequest;
                payloadObject.InboundDataFunction = function (CVacancyCandidateApplicationsResponse)
                {
                    // Show a structured rendering of the vacancy
                    TriSysStepByStep.Step2.PopulateVacanciesGrid(CVacancyCandidateApplicationsResponse.Vacancies);

                    return true;
                };

                payloadObject.ErrorHandlerFunction = function (request, status, error)
                {
                    alert('TriSysStepByStep.Step12.GetVacancyApplicationsFromWebAPI: ' + status + ": " + error + ". responseText: " + request.responseText);
                };

                TriSysAPI.Data.PostToWebAPI(payloadObject);
            }
        }
    },

    ContactTitles:      // TriSysStepByStep.ContactTitles
    {
        LoadCombo: function(sID, fnCallback)
        {
            var payloadObject = {};

            payloadObject.URL = 'Cache/ContactTitles';
            payloadObject.OutboundDataPacket = null;
            payloadObject.InboundDataFunction = function (CCachedContactTitles)
            {
                if (CCachedContactTitles.Success)
                {
                    for (var i = 0; i < CCachedContactTitles.ContactTitles.length; i++)
                    {
                        var contactTitle = CCachedContactTitles.ContactTitles[i];
                        $('#' + sID).append($('<option>', { value: contactTitle.Name }).text(contactTitle.Name));
                    }
                    $('#' + sID).val("(None)");

                    if (fnCallback)
                        fnCallback();
                }
                
                return true;
            };

            payloadObject.ErrorHandlerFunction = function (request, status, error)
            {
                alert('TriSysStepByStep.ContactTitles: ' + status + ": " + error + ". responseText: " + request.responseText);
            };

            TriSysAPI.Data.PostToWebAPI(payloadObject);
        }
    },

    // Maintain our own cookies to manage our state between pages
    Cookies:
    {
        Prefix: 'TriSys-StepByStep.',

        AfterLogin: function(sDataServicesKey)
        {
            var bLoggedIn = (sDataServicesKey ? true : false);
            TriSysAPI.Persistence.Write(TriSysStepByStep.Cookies.Prefix + "LoggedIn", bLoggedIn);
            TriSysAPI.Persistence.Write(TriSysStepByStep.Cookies.Prefix + "DataServicesKey", sDataServicesKey);

            TriSysAPI.Session.SetDataServicesKey(sDataServicesKey);
        },

        isLoggedIn: function()
        {
            var sLoggedIn = TriSysAPI.Persistence.Read(TriSysStepByStep.Cookies.Prefix + "LoggedIn");
            if(sLoggedIn)
                return TriSysAPI.Operators.stringToBoolean(sLoggedIn, false);
        },

        DataServicesKey: function()
        {
            var sDataServicesKey = TriSysAPI.Persistence.Read(TriSysStepByStep.Cookies.Prefix + "DataServicesKey");
            return sDataServicesKey;
        }
    },

    Redirect:
    {
        ifNotLoggedIn: function (sDoWhatWithoutBeingLoggedIn)        // TriSysStepByStep.Redirect.ifNotLoggedIn()
        {
            if (!TriSysStepByStep.Cookies.isLoggedIn())
            {
                alert("You are not logged in so cannot " + sDoWhatWithoutBeingLoggedIn + ".");
                window.location.replace("http://jobs.trisys.co.uk/step-6/");
            }
        }
    }

};  // TriSysStepByStep
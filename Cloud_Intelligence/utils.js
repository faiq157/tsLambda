const round = require("lodash/round");

exports.parseBoolean = (val) => {
  if (val == 'true') return true;
  if (val == 'false') return false;
  return val;
}

exports.getKeysAndValues = (data, type) => {
  let query = "";
  const values = [];
  let i = 1;

  if (type === "update") {
    for (const value in data) {
      query = `${query}${value}=$${i}, `;
      values.push(data[value]);
      i++;
    }
    query = query.slice(0, -2);
  } else if (type === "insert") {
    let placeholderVals = "";
    for (const value in data) {
      query = `${query} ${value},`;
      placeholderVals = `${placeholderVals}$${i},`;
      values.push(data[value]);
      i++;
    }

    query = `(${query.slice(0, -1)}) VALUES (${placeholderVals.slice(0, -1)})`;
  }
  return { query, values };
};

exports.compareVersionNumbers = function compareVersionNumbers(v1, v2) {
  var v1parts = v1.split(".");
  var v2parts = v2.split(".");

  // First, validate both numbers are true version numbers
  function validateParts(parts) {
    for (var i = 0; i < parts.length; ++i) {
      if (!isPositiveInteger(parts[i])) {
        return false;
      }
    }
    return true;
  }
  if (!validateParts(v1parts) || !validateParts(v2parts)) {
    return NaN;
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      continue;
    }
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    return -1;
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
};
function isPositiveInteger(x) {
  return /^\d+$/.test(x);
}
exports.roundNumber = function (number, decimalVal = 1) {
  return number ? round(number, decimalVal) : number;
};

exports.emailTempBatteryNotif = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }    

      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
      

      ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

        .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                            {{ project_location }}
                          </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p 
                            class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
							            <span>
                          {{#if is_multiSites}}
                          {{project_name}} | 
                          {{/if}}
                           {{ site_name }} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                            <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
							{{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{{msg}}}
                            </p>
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                    <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

exports.emailTempSiteMode = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }      

      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
      

      ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

        .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                            {{ project_location }}
                          </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p
                              class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
                              <span>
                              {{#if is_multiSites}}
                              {{project_name}} | 
                              {{/if}}
                              {{ site_name }} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                          <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{{body_text}}}
                            </p>
                            <br/>
                            {{{detail}}}
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                    <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

exports.emailTemp = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }

      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
       
       
       ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

        .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                              {{ project_location }}
                            </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p
                              class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
							            <span>
                          {{#if is_multiSites}}
                          {{project_name}} | 
                          {{/if}}
                          {{ site_name }} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                            <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            Reported by {{ asset_name }}
                            </p>
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                    <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;

exports.emailTempAssetStatus = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }
      
      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
      

      ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

        .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                                  {{ project_location }}
                                </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p 
                            class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
							<span>
              {{#if is_multiSites}}
              {{project_name}} | 
              {{/if}}
               {{ site_name }} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                            <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{{body_text}}}
                            </p>
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                    <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

/**
 * Weather config email template notifications
 */
exports.emailTempWeatherNotifications = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }      

      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
      

      ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

      .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                                  {{ project_location }}
                                </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p
                              class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
							            <span>
                          {{#if is_multiSites}}
                          {{project_name}} | 
                          {{/if}}
                           {{ site_name}} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                            <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{{body_text}}}
                            </p>
                            <br/>
                            {{{detail}}}
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                    <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

exports.emailTempVegetationNotifications = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!-- Yahoo App Android will strip this -->
  </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title></title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

      body {
        margin: 0;
        padding: 0;
      }
      .clean-body {
        max-width: 100%;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
      }

      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      .project-name,
      .project-location {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 20px;
        color: #212121;
        font-size: 14px;
        font-weight: 500;
      }

      .address {
        text-align: right;
        width: 250px;
        float: right;
      }      

      .address p {
        margin: 0;
        font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;
        font-style: normal;
        line-height: 18px;
        color: #646569;
        font-size: 12px;
        font-weight: 400;
      }
      

      ul {
        font-size: 16px;
        padding: 0px;
        margin: 0;
        font-size: 16px;
      }
      ul.disc {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      ul.dashed-margin {
        margin-left: 15px;
        margin-bottom: 10px;
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      
      ul.disc1 {
        list-style-type: disc;
        font-weight: 500;
        margin-left: 15px;
        line-height: 2;
      }
      ul.dashed1 {
        list-style-type: none;
        font-weight: 400;
        line-height: 1.3;
      }
      .dashed-li1 {
        border-top: #212121 solid 1px;
        width: 8px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    </style>
    <style type="text/css" id="media-query">
      @media only screen and (max-width: 520px) {
        .clean-body {
          width: 100% !important	;
        }
        .desktop {
          display: none !important;
        }
        .mobile {
          display: inline-block !important;
        }
        .num12 {
          padding: 20px 30px 50px !important;
        }
        .block-grid {
          width: 100% !important;
          padding: 0 30px !important;
        }
        .pd-left {
          padding-left: 30px !important;
        }
        .pd-right {
          padding-right: 30px !important;
        }
        .img-container {
          width: 85%;
          text-align: center;
        }

        .button {
          width: 100%;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 0 auto;
          width: 100%;
        }

        .num8-child {
          margin-right: 20px !important;
        }

        .project-name {
          display: block;
        }

        .address h5 {
          width: 100%;
        }

        .logo-img {
          float: none !important;
          padding-bottom: 20px;
        }
        .status-text {
          font-size: 24px !important;
          width: 70% !important;
        }
        .more-info-button {
          width: 95% !important;
        }
      }
    </style>
  </head>

  <body
    class="clean-body"
    style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;width: 600px;"
  >
    <table
      class="nl-container"
      style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent; width: 100%;"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%"
      bgcolor="transparent"
      valign="top"
    >
      <tbody>
        <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
            <div style="background-color:transparent;">
              <!-- <div
                class="block-grid "
                style="Margin: 0 auto;padding: 0 50px; min-width: 320px; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
			  > -->
              <table
                style="margin: 0 auto;padding: 0; min-width: 320px; width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"
                class="block-grid"
                cellspacing="0"
                cellpadding="0"
              >
                <tr>
                  <!-- style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;" -->
                  <td
                    class="col num12"
                    style="min-width: 320px; vertical-align: top;  padding: 20px 50px 30px;"
                  >
                    <div style="width:100%">
                      <div
                        style="border-top:0px solid transparent; 
						border-left:0px solid transparent; 
						border-bottom:0px solid transparent; 
						border-right:0px solid transparent; 
						padding-top:5px; padding-bottom:5px; 
						padding: 0 0 0 0;"
                      >
                        <table
                          style="width: 100%;  border-bottom: 1px solid #E0E0E1; "
                          class="header-wrapper desktop"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td style="padding-bottom: 30px;">
                              <img
                                class="logo-img center autowidth"
                                align="center"
                                border="0"
                                src="{{s3_asset_url}}logo1.png"
                                alt="Logo"
                                title="Logo"
                                style="text-decoration: none;
								padding: 0;
								 -ms-interpolation-mode: bicubic; border: 0; 
								 height: auto;	width: 201px;	 max-width: 201px;
								  display: inline-block;"
                                width="201"
                              />
                            </td>
                            <td style="padding-bottom: 30px; vertical-align: middle;">
                              <div class="address">
                                <h5 class="project-name">
                                  Project {{ project_name }}
                                </h5>
                                <p>
                                  {{ project_location }}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <div
                          class="img-container mobile center autowidth"
                          style=" display: none;
						   width: 100%; 
						  border-bottom: 1px solid #E0E0E1; 
						  width: 100%; padding-bottom: 0;"
                        >
                          <img
                            class="logo-img center autowidth"
                            align="center"
                            border="0"
                            src="{{s3_asset_url}}logo1.png"
                            alt="Logo"
                            title="Logo"
                            style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0;   height: auto; width: 201px; max-width: 201px; display: inline-block;"
                            width="201"
                          />
                          <div class="address">
                            <h5 class="project-name">
                              Project {{ project_name }}
                            </h5>
                            <p>
                                  {{ project_location }}
                                </p>
                            <br />
                            <br />
                          </div>
                        </div>
                        <br />
                        <br />
                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <div
                            style="line-height: 24px; font-size: 12px; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; color: #212121; mso-line-height-alt: 14px;"
                          >
                            <p
                              class="status-text"
                              style="font-size: 20px; line-height: 24px; word-break: break-word; text-align: left; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 29px; margin: 0;font-weight: 700; line-height: 38px; color: #212121; width: 90%"
                            >
							<span>
              {{#if is_multiSites}}
              {{project_name}} | 
              {{/if}}
               {{ site_name }} | {{ status_text }}</span>
                            </p>
                          </div>
                        </div>

                        <div
                          style="width: 100%; color:#212121;font-family:Roboto, Arial, sans-serif, Helvetica Neue, Helvetica;line-height:1.2;padding-top:0;padding-right:0;padding-bottom:0;"
                        >
                          <br />
                          <div
                            style="line-height: 24px; font-size: 12px; color: #212121; font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; mso-line-height-alt: 14px;"
                          >
                            <p
                              style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{ timestamp }}
                            </p>
                            <br/>
                            <p
                            style="line-height: 24px; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0; font-weight: 400; color: #212121;"
                            >
                            {{{body_text}}}
                            </p>
                            <br/>
                            {{{detail}}}
                          </div>
                        </div>
                        <br />
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <table
                                class="button-wrapper"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="border-radius: 5px;"
                                    bgcolor="#002bcb"
                                  >
                                     <a
                                      target="_blank"
                                      href="{{url}}"
                                      class="more-info-button"
                                      style="font-family: Roboto, Arial, sans-serif, Helvetica Neue, Helvetica; 
									  padding: 13px 15px;
									  border-radius: 4px;
									  font-size: 16px;
									  color: #FFFFFF;
									  border: 1px solid #002bcb;
									  background-color: #002bcb;
									  text-decoration: none; 
									  font-weight: 500;
									  display: inline-block; 
									  text-align: center;
									  width: 200px;
                    height: 48px;
									  box-shadow: 0px 4px 8px rgba(0,43,203,0.3);"
                                    >
                                      MORE INFO
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <table
              style="width: 100%; Margin: 0 auto; padding: 0; max-width: 100%; background-color:#f8f8f8; margin-top: 30px;"
              class="footer"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="pd-left"
                    style="text-align:left; vertical-align: middle; padding-left: 50px; padding-top: 20px; padding-bottom: 20px;"
                  >
                    <img
                      class="center autowidth"
                      align="center"
                      border="0"
                      src="{{s3_asset_url}}app-logo.png"
                      alt="Logo"
                      title="Logo"
                      style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 36px; max-width: 36px; display: block;"
                      width="36"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

using System;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ContosoUniversity.WebForms.Pages.Admin
{
    public partial class LoginPage : Page
    {
        protected void LoginControl_Authenticate(object sender, AuthenticateEventArgs e)
        {
            var login = (Login)sender;
            var username = login.UserName;
            var password = login.Password;

            // In production this would validate against a membership provider or AD.
            // For the sample, accept admin/admin.
            if (username == "admin" && password == "admin")
            {
                e.Authenticated = true;
                FormsAuthentication.RedirectFromLoginPage(username,
                    ((CheckBox)login.FindControl("RememberMe")).Checked);
            }
            else
            {
                e.Authenticated = false;
            }
        }
    }
}

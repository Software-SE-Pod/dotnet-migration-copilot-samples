<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Login.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Admin.LoginPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Sign In</h2>

    <asp:Login ID="LoginControl" runat="server"
        OnAuthenticate="LoginControl_Authenticate"
        DisplayRememberMe="true"
        TitleText=""
        UserNameLabelText="Username:"
        PasswordLabelText="Password:"
        LoginButtonText="Sign In"
        FailureText="Invalid username or password."
        CssClass="login-form">
        <LayoutTemplate>
            <div class="form-group">
                <asp:Label ID="UserNameLabel" runat="server" AssociatedControlID="UserName" Text="Username:" />
                <asp:TextBox ID="UserName" runat="server" />
                <asp:RequiredFieldValidator ID="UserNameRequired" runat="server"
                    ControlToValidate="UserName" ErrorMessage="Username is required." Display="Dynamic" />
            </div>
            <div class="form-group">
                <asp:Label ID="PasswordLabel" runat="server" AssociatedControlID="Password" Text="Password:" />
                <asp:TextBox ID="Password" runat="server" TextMode="Password" />
                <asp:RequiredFieldValidator ID="PasswordRequired" runat="server"
                    ControlToValidate="Password" ErrorMessage="Password is required." Display="Dynamic" />
            </div>
            <div class="form-group">
                <asp:CheckBox ID="RememberMe" runat="server" Text="Remember me" />
            </div>
            <div class="form-actions">
                <asp:Button ID="LoginButton" runat="server" CommandName="Login" Text="Sign In" CssClass="btn-primary" />
            </div>
            <asp:Literal ID="FailureText" runat="server" EnableViewState="False" />
        </LayoutTemplate>
    </asp:Login>
</asp:Content>

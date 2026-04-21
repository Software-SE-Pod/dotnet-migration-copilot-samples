<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="StudentEdit.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Students.StudentEditPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2><asp:Literal ID="litTitle" runat="server" Text="Add Student" /></h2>

    <asp:ValidationSummary ID="ValidationSummary1" runat="server" CssClass="validation-summary" />

    <div class="form-group">
        <asp:Label ID="lblLastName" runat="server" AssociatedControlID="txtLastName" Text="Last Name:" />
        <asp:TextBox ID="txtLastName" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator ID="rfvLastName" runat="server"
            ControlToValidate="txtLastName" ErrorMessage="Last name is required."
            Display="Dynamic" CssClass="field-error" />
    </div>

    <div class="form-group">
        <asp:Label ID="lblFirstName" runat="server" AssociatedControlID="txtFirstName" Text="First Name:" />
        <asp:TextBox ID="txtFirstName" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator ID="rfvFirstName" runat="server"
            ControlToValidate="txtFirstName" ErrorMessage="First name is required."
            Display="Dynamic" CssClass="field-error" />
    </div>

    <div class="form-group">
        <asp:Label ID="lblEnrollDate" runat="server" AssociatedControlID="txtEnrollmentDate" Text="Enrollment Date:" />
        <asp:TextBox ID="txtEnrollmentDate" runat="server" TextMode="Date" />
        <asp:RequiredFieldValidator ID="rfvEnrollDate" runat="server"
            ControlToValidate="txtEnrollmentDate" ErrorMessage="Enrollment date is required."
            Display="Dynamic" CssClass="field-error" />
    </div>

    <div class="form-actions">
        <asp:Button ID="btnSave" runat="server" Text="Save" OnClick="btnSave_Click" CssClass="btn-primary" />
        <asp:HyperLink ID="lnkCancel" runat="server" NavigateUrl="StudentList.aspx" Text="Cancel" CssClass="btn-secondary" />
    </div>

    <asp:Label ID="lblError" runat="server" CssClass="error-message" Visible="false" />
</asp:Content>

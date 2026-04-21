<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="DepartmentEdit.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Departments.DepartmentEditPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2><asp:Literal ID="litTitle" runat="server" Text="Add Department" /></h2>

    <asp:ValidationSummary ID="vs" runat="server" CssClass="validation-summary" />
    <asp:HiddenField ID="hfRowVersion" runat="server" />

    <div class="form-group">
        <asp:Label runat="server" Text="Name:" AssociatedControlID="txtName" />
        <asp:TextBox ID="txtName" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="txtName"
            ErrorMessage="Name is required." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Budget:" AssociatedControlID="txtBudget" />
        <asp:TextBox ID="txtBudget" runat="server" TextMode="Number" />
        <asp:RangeValidator runat="server" ControlToValidate="txtBudget" Type="Currency"
            MinimumValue="0" MaximumValue="1000000000" ErrorMessage="Invalid budget." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Start Date:" AssociatedControlID="txtStartDate" />
        <asp:TextBox ID="txtStartDate" runat="server" TextMode="Date" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Administrator:" AssociatedControlID="ddlAdmin" />
        <asp:DropDownList ID="ddlAdmin" runat="server" AppendDataBoundItems="true">
            <asp:ListItem Text="-- None --" Value="" />
        </asp:DropDownList>
    </div>

    <div class="form-actions">
        <asp:Button ID="btnSave" runat="server" Text="Save" OnClick="btnSave_Click" CssClass="btn-primary" />
        <asp:HyperLink runat="server" NavigateUrl="DepartmentList.aspx" Text="Cancel" CssClass="btn-secondary" />
    </div>

    <asp:Label ID="lblConcurrency" runat="server" CssClass="error-message" Visible="false" />
</asp:Content>

<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="DepartmentList.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Departments.DepartmentListPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Departments</h2>

    <asp:GridView ID="gvDepartments" runat="server"
        AutoGenerateColumns="False"
        DataKeyNames="DepartmentID"
        AllowSorting="True"
        OnSorting="gvDepartments_Sorting"
        CssClass="data-grid">
        <Columns>
            <asp:BoundField DataField="Name" HeaderText="Name" SortExpression="Name" />
            <asp:BoundField DataField="Budget" HeaderText="Budget" DataFormatString="{0:C}" SortExpression="Budget" />
            <asp:BoundField DataField="StartDate" HeaderText="Start Date" DataFormatString="{0:d}" />
            <asp:TemplateField HeaderText="Administrator">
                <ItemTemplate><%# Eval("Administrator.FullName") %></ItemTemplate>
            </asp:TemplateField>
            <asp:HyperLinkField Text="Edit"
                DataNavigateUrlFields="DepartmentID"
                DataNavigateUrlFormatString="DepartmentEdit.aspx?id={0}" />
        </Columns>
    </asp:GridView>

    <p><a href="DepartmentEdit.aspx">Add New Department</a></p>
</asp:Content>
